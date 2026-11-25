/* AuraArriendos — capa de datos del frontend.

   Desde la EP3 los datos principales viven en el BACKEND (Spring Boot + MySQL):
   propiedades (productos), categorías, usuarios, órdenes (boletas) y la sesión (JWT).

   ¿Cómo funciona?
   - LECTURA: los componentes siguen leyendo con funciones síncronas (getPropiedades(), ...).
     Esas funciones leen una CACHÉ local que se llena con sincronizar(), que llama a la API.
   - ESCRITURA: crear, editar y eliminar son funciones async que llaman a la API y,
     si el backend responde bien, actualizan la caché. Si el backend rechaza la acción
     (validación, permisos, regla de negocio), lanzan un ApiError con el mensaje del servidor.
   - Cada cambio en la caché avisa a los componentes (emit) para que se vuelvan a dibujar
     (ver hooks/useStore.js).

   Quedan solo en el navegador (no son parte del modelo del backend): el carrito de
   solicitudes, el blog, los mensajes de contacto y las visitas/entregas. */

import { api, tokens, onSesionExpirada } from "./api";
import { PROPIEDADES, USUARIOS, BLOG, CATEGORIAS, ORDENES } from "./manifest";

const KEYS = {
  /* Caché de datos del backend */
  propiedades: "aura_propiedades",
  usuarios: "aura_usuarios",
  categorias: "aura_categorias",
  ordenes: "aura_ordenes",
  sesion: "aura_sesion",
  /* Datos que solo viven en el navegador */
  solicitudes: "aura_solicitudes",
  blog: "aura_blog",
  mensajes: "aura_mensajes",
  tramites: "aura_tramites"
};

/* ---------- Suscripción (para useSyncExternalStore) ---------- */

let version = 0;
const listeners = new Set();

function emit() {
  version++;
  listeners.forEach((l) => l());
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getVersion() {
  return version;
}

/* Cambios hechos en otra pestaña del mismo sitio. */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (!e.key || e.key.indexOf("aura_") === 0) emit();
  });
}

/* ---------- Lectura / escritura en localStorage ---------- */

function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("[AuraStore] lectura falló para " + key, e);
    return fallback;
  }
}

function writeJSON(key, value, { silent = false } = {}) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    if (!silent) emit();
    return true;
  } catch (e) {
    console.warn("[AuraStore] escritura falló para " + key, e);
    return false;
  }
}

function removeKey(key) {
  try { window.localStorage.removeItem(key); } catch (e) { /* noop */ }
}

const mismoId = (a, b) => String(a) === String(b);

/* Upsert genérico por campo clave (los ids del backend pueden ser números). */
function upsert(key, item, campo) {
  const lista = readJSON(key, []);
  const idx = lista.findIndex((x) => mismoId(x[campo], item[campo]));
  if (idx >= 0) lista[idx] = item;
  else lista.push(item);
  return writeJSON(key, lista);
}

function quitar(key, id, campo = "id") {
  writeJSON(key, readJSON(key, []).filter((x) => !mismoId(x[campo], id)));
}

const porFechaDesc = (a, b) => String(b.fecha || "").localeCompare(String(a.fecha || ""));

/* Datos locales por defecto (los que no vienen del backend). */
function sembrarLocales() {
  if (readJSON(KEYS.solicitudes, null) === null) writeJSON(KEYS.solicitudes, [], { silent: true });
  if (readJSON(KEYS.blog, null) === null) writeJSON(KEYS.blog, BLOG, { silent: true });
  if (readJSON(KEYS.mensajes, null) === null) writeJSON(KEYS.mensajes, [], { silent: true });
  if (readJSON(KEYS.tramites, null) === null) writeJSON(KEYS.tramites, [], { silent: true });
}

if (typeof window !== "undefined") sembrarLocales();

/* Deja la caché con los datos de ejemplo de manifest.js, sin sesión.
   Lo usan las PRUEBAS (Vitest), que no se conectan al backend. */
export function reiniciarDatos() {
  Object.values(KEYS).forEach(removeKey);
  tokens.borrar();
  sembrarLocales();
  writeJSON(KEYS.propiedades, PROPIEDADES, { silent: true });
  writeJSON(KEYS.usuarios, USUARIOS, { silent: true });
  writeJSON(KEYS.categorias, CATEGORIAS, { silent: true });
  writeJSON(KEYS.ordenes, ORDENES, { silent: true });
  emit();
}

/* ---------- Sincronización con el backend ---------- */

/* Trae del backend lo que el usuario actual puede ver, según su rol:
   - Todos: propiedades publicadas y categorías.
   - Cliente: además sus publicaciones (aunque estén pendientes) y sus boletas.
   - Vendedor: todas las propiedades y todas las boletas.
   - Administrador: lo anterior + usuarios.
   Usa Promise.allSettled: si una parte falla, el resto igual se actualiza. */
export async function sincronizar() {
  const sesion = getSesion();
  const staff = esStaff(sesion);
  const admin = esAdmin(sesion);
  const correo = sesion ? encodeURIComponent(sesion.correo) : "";

  const tareas = [
    (async () => {
      let lista = await api.get(staff ? "/productos/todos" : "/productos");
      if (sesion && !staff) {
        const mias = await api.get("/productos/publicador/" + correo).catch(() => []);
        const ids = new Set(lista.map((p) => p.id));
        lista = lista.concat(mias.filter((p) => !ids.has(p.id)));
      }
      writeJSON(KEYS.propiedades, lista, { silent: true });
    })(),
    api.get("/categorias").then((lista) => writeJSON(KEYS.categorias, lista, { silent: true }))
  ];
  if (admin) {
    tareas.push(api.get("/usuarios").then((lista) => writeJSON(KEYS.usuarios, lista, { silent: true })));
  }
  if (staff) {
    tareas.push(api.get("/boletas").then((lista) => writeJSON(KEYS.ordenes, lista, { silent: true })));
  } else if (sesion) {
    tareas.push(api.get("/boletas/usuario/" + correo).then((lista) => writeJSON(KEYS.ordenes, lista, { silent: true })));
  }

  const resultados = await Promise.allSettled(tareas);
  emit();
  const errores = resultados.filter((r) => r.status === "rejected").map((r) => r.reason);
  if (errores.length) console.warn("[AuraStore] sincronización incompleta", errores);
  return errores;
}

/* ---------- Sesión (JWT) ---------- */

/* Guarda los tokens y los datos del usuario que entrega el backend al iniciar sesión. */
export function establecerSesion({ accessToken, refreshToken, usuario }) {
  tokens.guardar(accessToken, refreshToken);
  writeJSON(KEYS.sesion, usuario);
}

/* Borra la sesión y los datos privados de la caché (usuarios y órdenes). */
function limpiarSesion() {
  tokens.borrar();
  removeKey(KEYS.sesion);
  writeJSON(KEYS.usuarios, [], { silent: true });
  writeJSON(KEYS.ordenes, [], { silent: true });
  emit();
}

/* Si la renovación del token falla, la API avisa y se cierra la sesión. */
onSesionExpirada(limpiarSesion);

export async function iniciarSesion(correo, clave) {
  const respuesta = await api.post("/auth/login", { correo: String(correo).trim(), clave });
  establecerSesion(respuesta);
  await sincronizar();
  return respuesta.usuario;
}

/* Registro público: el backend siempre crea un Cliente y deja la sesión iniciada. */
export async function registrarCliente(datos) {
  const respuesta = await api.post("/auth/registro", datos);
  establecerSesion(respuesta);
  await sincronizar();
  return respuesta.usuario;
}

/* Al abrir o recargar la página: si hay tokens guardados se valida la sesión con
   /auth/me (si el token de acceso venció, api.js lo renueva solo). Si no es válida, se borra.
   Nunca se confía en los datos guardados: el backend decide quién es el usuario. */
export async function restaurarSesion() {
  if (tokens.leer()) {
    try {
      const usuario = await api.get("/auth/me");
      writeJSON(KEYS.sesion, usuario, { silent: true });
    } catch (e) {
      if (e.estado === 401) limpiarSesion();
    }
  } else if (getSesion()) {
    limpiarSesion();
  }
  await sincronizar();
  return getSesion();
}

export function cerrarSesion() {
  const actuales = tokens.leer();
  if (actuales && actuales.refreshToken) {
    api.post("/auth/logout", { refreshToken: actuales.refreshToken }).catch(() => { /* la sesión local se cierra igual */ });
  }
  limpiarSesion();
  sincronizar().catch(() => { /* sin conexión: se mantiene la caché pública */ });
}

export function getSesion() {
  return readJSON(KEYS.sesion, null);
}

export function esAdmin(sesion) {
  return !!sesion && sesion.tipoUsuario === "Administrador";
}

export function esVendedor(sesion) {
  return !!sesion && sesion.tipoUsuario === "Vendedor";
}

/* Personal con acceso al panel: Administrador o Vendedor. */
export function esStaff(sesion) {
  return esAdmin(sesion) || esVendedor(sesion);
}

/* El usuario edita su propio perfil (no puede cambiar su rol ni su RUN). */
export async function actualizarPerfil(datos) {
  const usuario = await api.put("/auth/me", datos);
  writeJSON(KEYS.sesion, usuario, { silent: true });
  if (readJSON(KEYS.usuarios, []).some((u) => mismoId(u.id, usuario.id))) upsert(KEYS.usuarios, usuario, "id");
  else emit();
  return usuario;
}

/* ---------- Propiedades (PRODUCTO) ---------- */

export function getPropiedades() {
  return readJSON(KEYS.propiedades, []);
}

export function getPropiedadPorId(id) {
  return getPropiedades().find((p) => mismoId(p.id, id)) || null;
}

/* Sugerencia de código para el formulario (el id definitivo lo asigna el backend). */
export function nuevoIdPropiedad() {
  let max = 1000;
  getPropiedades().forEach((p) => {
    const n = parseInt(String(p.id).replace(/\D/g, ""), 10);
    if (!isNaN(n) && n > max) max = n;
  });
  return "PR-" + (max + 1);
}

/* Administrador crea una propiedad. */
export async function crearPropiedad(datos) {
  const creada = await api.post("/productos", datos);
  upsert(KEYS.propiedades, creada, "id");
  return creada;
}

export async function actualizarPropiedad(id, datos) {
  const actualizada = await api.put("/productos/" + encodeURIComponent(id), datos);
  upsert(KEYS.propiedades, actualizada, "id");
  return actualizada;
}

/* Un cliente publica su propiedad: queda "pendiente" hasta que el administrador la revise. */
export async function publicarPropiedad(datos) {
  const creada = await api.post("/productos/publicaciones", datos);
  upsert(KEYS.propiedades, creada, "id");
  return creada;
}

/* Moderación: "publicada" (aprobar) o "rechazada" (con motivo obligatorio). */
export async function cambiarEstadoPropiedad(id, estado, motivo) {
  const actualizada = await api.patch("/productos/" + encodeURIComponent(id) + "/estado", { estado, motivo });
  upsert(KEYS.propiedades, actualizada, "id");
  return actualizada;
}

export async function marcarArrendada(id, arrendada) {
  const actualizada = await api.patch("/productos/" + encodeURIComponent(id) + "/arrendada", { arrendada: !!arrendada });
  upsert(KEYS.propiedades, actualizada, "id");
  return actualizada;
}

export async function eliminarPropiedad(id) {
  await api.del("/productos/" + encodeURIComponent(id));
  quitar(KEYS.propiedades, id);
}

/* Propiedades cuyo stock está en o bajo el nivel crítico definido. */
export function getPropiedadesCriticas() {
  return getPropiedades().filter((p) => {
    const critico = p.alertaDisponibilidad;
    return critico != null && Number(p.unidadesDisponibles || 0) <= Number(critico);
  });
}

/* ---------- Usuarios (USUARIO) ---------- */

export function getUsuarios() {
  return readJSON(KEYS.usuarios, []);
}

export function getUsuarioPorCorreo(correo) {
  const buscado = String(correo || "").trim().toLowerCase();
  const encontrado = getUsuarios().find((u) => String(u.correo).toLowerCase() === buscado);
  if (encontrado) return encontrado;
  /* Un cliente no tiene la lista de usuarios, pero sí sus propios datos en la sesión. */
  const sesion = getSesion();
  return sesion && String(sesion.correo).toLowerCase() === buscado ? sesion : null;
}

export function getUsuarioPorRun(run) {
  return getUsuarios().find((u) => u.run === run) || null;
}

export async function crearUsuario(datos) {
  const creado = await api.post("/usuarios", datos);
  upsert(KEYS.usuarios, creado, "id");
  return creado;
}

export async function actualizarUsuario(id, datos) {
  const actualizado = await api.put("/usuarios/" + encodeURIComponent(id), datos);
  upsert(KEYS.usuarios, actualizado, "id");
  const sesion = getSesion();
  if (sesion && mismoId(sesion.id, actualizado.id)) writeJSON(KEYS.sesion, actualizado);
  return actualizado;
}

export async function eliminarUsuario(id) {
  await api.del("/usuarios/" + encodeURIComponent(id));
  quitar(KEYS.usuarios, id);
}

/* ---------- Solicitudes de arriendo (el "carrito") ---------- */

export function getSolicitudes() {
  return readJSON(KEYS.solicitudes, []);
}

export function estaEnSolicitudes(id) {
  return getSolicitudes().indexOf(id) !== -1;
}

export function agregarSolicitud(id) {
  const lista = getSolicitudes();
  if (lista.indexOf(id) === -1) {
    lista.push(id);
    writeJSON(KEYS.solicitudes, lista);
  }
  return lista;
}

export function quitarSolicitud(id) {
  const lista = getSolicitudes().filter((x) => x !== id);
  writeJSON(KEYS.solicitudes, lista);
  return lista;
}

export function vaciarSolicitudes() {
  writeJSON(KEYS.solicitudes, []);
}

/* ---------- Blog ---------- */

export function getBlog() {
  return readJSON(KEYS.blog, []).slice().sort(porFechaDesc);
}

export function getPostPorId(id) {
  return readJSON(KEYS.blog, []).find((b) => b.id === id) || null;
}

export function guardarPost(post) {
  return upsert(KEYS.blog, post, "id") ? post : null;
}

export function eliminarPost(id) {
  writeJSON(KEYS.blog, readJSON(KEYS.blog, []).filter((b) => b.id !== id));
}

export function nuevoIdPost(titulo) {
  const base = String(titulo || "publicacion")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "publicacion";
  let id = base;
  let n = 2;
  while (getPostPorId(id)) { id = base + "-" + n; n++; }
  return id;
}

/* ---------- Mensajes (Inbox) ---------- */

export function getMensajes() {
  return readJSON(KEYS.mensajes, []).slice().sort(porFechaDesc);
}

export function guardarMensaje({ nombre, correo, comentario }) {
  const mensaje = {
    id: "MSG-" + Date.now(),
    nombre,
    correo,
    comentario,
    fecha: new Date().toISOString(),
    leido: false
  };
  const lista = readJSON(KEYS.mensajes, []);
  lista.push(mensaje);
  writeJSON(KEYS.mensajes, lista);
  return mensaje;
}

export function marcarMensajeLeido(id, leido) {
  const lista = readJSON(KEYS.mensajes, []);
  lista.forEach((m) => { if (m.id === id) m.leido = !!leido; });
  writeJSON(KEYS.mensajes, lista);
}

export function eliminarMensaje(id) {
  writeJSON(KEYS.mensajes, readJSON(KEYS.mensajes, []).filter((m) => m.id !== id));
}

export function contarMensajesNoLeidos() {
  return readJSON(KEYS.mensajes, []).filter((m) => !m.leido).length;
}

/* ---------- Trámites: visitas y entregas ----------
   Al confirmar una entrega ("Entregado") la propiedad se marca arrendada. */

export function getTramites() {
  return readJSON(KEYS.tramites, []).slice().sort(porFechaDesc);
}

export function getTramitePorId(id) {
  return readJSON(KEYS.tramites, []).find((t) => t.id === id) || null;
}

export function guardarTramite(tramite) {
  upsert(KEYS.tramites, tramite, "id");
  if (tramite.tipo === "entrega") {
    /* La disponibilidad vive en el backend: se actualiza allí (si falla, se avisa en consola). */
    marcarArrendada(tramite.propiedadId, tramite.estado === "Entregado")
      .catch((e) => console.warn("[AuraStore] no se pudo actualizar la propiedad", e));
  }
  return tramite;
}

export function eliminarTramite(id) {
  writeJSON(KEYS.tramites, readJSON(KEYS.tramites, []).filter((t) => t.id !== id));
}

export function nuevoIdTramite() {
  return "TR-" + Date.now();
}

/* ---------- Categorías (CATEGORIA) ---------- */

export function getCategorias() {
  return readJSON(KEYS.categorias, []);
}

export function getCategoriaPorId(id) {
  return getCategorias().find((c) => mismoId(c.id, id)) || null;
}

/* El backend genera el id desde el nombre (ej: "casa-de-campo"). */
export async function crearCategoria(datos) {
  const creada = await api.post("/categorias", datos);
  upsert(KEYS.categorias, creada, "id");
  return creada;
}

/* Si cambia el nombre, las propiedades lo muestran actualizado: se vuelve a sincronizar. */
export async function actualizarCategoria(id, datos) {
  const actualizada = await api.put("/categorias/" + encodeURIComponent(id), datos);
  upsert(KEYS.categorias, actualizada, "id");
  await sincronizar();
  return actualizada;
}

/* El backend responde 409 si la categoría tiene propiedades: se lanza el error con su mensaje. */
export async function eliminarCategoria(id) {
  await api.del("/categorias/" + encodeURIComponent(id));
  quitar(KEYS.categorias, id);
}

/* ---------- Órdenes (BOLETA + DETALLE_BOLETA) ---------- */

export function getOrdenes() {
  return readJSON(KEYS.ordenes, []).slice().sort(porFechaDesc);
}

export function getOrdenPorId(id) {
  return readJSON(KEYS.ordenes, []).find((o) => mismoId(o.id, id)) || null;
}

export function getOrdenesDeUsuario(correo) {
  const buscado = String(correo || "").toLowerCase();
  return getOrdenes().filter((o) => String(o.usuarioCorreo || o.cliente?.correo || "").toLowerCase() === buscado);
}

/* Checkout: el backend valida disponibilidad, fecha y tarjeta, calcula el total,
   procesa el pago (simulado) y genera la boleta "pagada" o "rechazada".
   Después se sincroniza para ver el stock actualizado. */
export async function pagarReserva(datos) {
  const boleta = await api.post("/boletas", datos);
  upsert(KEYS.ordenes, boleta, "id");
  await sincronizar();
  return boleta;
}
