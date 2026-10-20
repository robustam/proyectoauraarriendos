/* AuraArriendos — capa de datos sobre localStorage (simula el backend).
   Siembra los arreglos de services/manifest.js la primera vez y expone
   operaciones CRUD. Cada escritura notifica a los suscriptores para que los
   componentes React se vuelvan a renderizar (ver hooks/useStore.js). */

import { PROPIEDADES, USUARIOS, BLOG, CATEGORIAS, ORDENES } from "./manifest";

const KEYS = {
  propiedades: "aura_propiedades",
  usuarios: "aura_usuarios",
  sesion: "aura_sesion",
  solicitudes: "aura_solicitudes",
  blog: "aura_blog",
  mensajes: "aura_mensajes",
  tramites: "aura_tramites",
  categorias: "aura_categorias",
  ordenes: "aura_ordenes",
  seed: "aura_seed_v3",
  migracion: "aura_migracion_v4",
  migracion5: "aura_migracion_v5"
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

/* ---------- Lectura / escritura ---------- */

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

/* Normaliza rutas antiguas ("../img/x.jpg", "assets/img/x.jpg") a "/img/x.jpg". */
function normalizarRuta(src) {
  if (typeof src !== "string" || !src || src.indexOf("data:") === 0) return src;
  let s = src.replace(/^(\.\.\/)+/, "");
  if (s.indexOf("assets/img/") === 0) s = s.slice(7);
  if (s.indexOf("img/") === 0) s = "/" + s;
  return s;
}

function seedIfNeeded() {
  if (readJSON(KEYS.seed, false) !== true) {
    writeJSON(KEYS.propiedades, PROPIEDADES, { silent: true });
    writeJSON(KEYS.usuarios, USUARIOS, { silent: true });
    writeJSON(KEYS.solicitudes, [], { silent: true });
    writeJSON(KEYS.seed, true, { silent: true });
  }
  if (readJSON(KEYS.blog, null) === null) writeJSON(KEYS.blog, BLOG, { silent: true });
  if (readJSON(KEYS.mensajes, null) === null) writeJSON(KEYS.mensajes, [], { silent: true });
  if (readJSON(KEYS.tramites, null) === null) writeJSON(KEYS.tramites, [], { silent: true });
  if (readJSON(KEYS.categorias, null) === null) writeJSON(KEYS.categorias, CATEGORIAS, { silent: true });
  if (readJSON(KEYS.ordenes, null) === null) writeJSON(KEYS.ordenes, ORDENES, { silent: true });
}

function migrarDatos() {
  if (readJSON(KEYS.migracion, false) === true) return;

  let props = readJSON(KEYS.propiedades, []);
  props.forEach((p) => {
    if (p.imagen) p.imagen = normalizarRuta(p.imagen);
    if (!Array.isArray(p.imagenes) || p.imagenes.length === 0) {
      const semilla = PROPIEDADES.find((m) => m.id === p.id);
      p.imagenes = semilla ? semilla.imagenes.slice() : p.imagen ? [p.imagen] : [];
    }
    p.imagenes = p.imagenes.map(normalizarRuta);
  });
  /* Se dejaron de ofrecer las categorías Oficina y Parcela. */
  props = props.filter((p) => p.categoria !== "Oficina" && p.categoria !== "Parcela");
  writeJSON(KEYS.propiedades, props, { silent: true });

  const posts = readJSON(KEYS.blog, []);
  posts.forEach((b) => { b.imagen = normalizarRuta(b.imagen); });
  writeJSON(KEYS.blog, posts, { silent: true });

  writeJSON(KEYS.migracion, true, { silent: true });
}

/* v5: agrega el precio de oferta a las propiedades semilla ya guardadas. */
function migrarV5() {
  if (readJSON(KEYS.migracion5, false) === true) return;
  const props = readJSON(KEYS.propiedades, []);
  props.forEach((p) => {
    const semilla = PROPIEDADES.find((m) => m.id === p.id);
    if (semilla && semilla.precioOferta && p.precioOferta === undefined) p.precioOferta = semilla.precioOferta;
  });
  writeJSON(KEYS.propiedades, props, { silent: true });
  writeJSON(KEYS.migracion5, true, { silent: true });
}

/* Vuelve a cargar los datos de ejemplo (lo usan las pruebas y el panel). */
export function reiniciarDatos() {
  Object.values(KEYS).forEach((k) => {
    try { window.localStorage.removeItem(k); } catch (e) { /* noop */ }
  });
  seedIfNeeded();
  migrarDatos();
  migrarV5();
  emit();
}

if (typeof window !== "undefined") {
  seedIfNeeded();
  migrarDatos();
  migrarV5();
}

/* Upsert genérico por campo clave. */
function upsert(key, item, campo) {
  const lista = readJSON(key, []);
  const idx = lista.findIndex((x) => x[campo] === item[campo]);
  if (idx >= 0) lista[idx] = item;
  else lista.push(item);
  return writeJSON(key, lista);
}

const porFechaDesc = (a, b) => String(b.fecha || "").localeCompare(String(a.fecha || ""));

/* ---------- Propiedades ---------- */

export function getPropiedades() {
  return readJSON(KEYS.propiedades, []);
}

export function getPropiedadPorId(id) {
  return getPropiedades().find((p) => p.id === id) || null;
}

export function guardarPropiedad(propiedad) {
  if (!Array.isArray(propiedad.imagenes) || propiedad.imagenes.length === 0) {
    propiedad.imagenes = propiedad.imagen ? [propiedad.imagen] : [];
  }
  return upsert(KEYS.propiedades, propiedad, "id") ? propiedad : null;
}

export function eliminarPropiedad(id) {
  writeJSON(KEYS.propiedades, getPropiedades().filter((p) => p.id !== id));
}

export function nuevoIdPropiedad() {
  let max = 1000;
  getPropiedades().forEach((p) => {
    const n = parseInt(String(p.id).replace(/\D/g, ""), 10);
    if (!isNaN(n) && n > max) max = n;
  });
  return "PR-" + (max + 1);
}

export function marcarArrendada(id, arrendada) {
  const p = getPropiedadPorId(id);
  if (!p) return null;
  p.arrendada = !!arrendada;
  if (arrendada) p.fechaArrendada = new Date().toISOString();
  else delete p.fechaArrendada;
  return guardarPropiedad(p);
}

/* ---------- Usuarios ---------- */

export function getUsuarios() {
  return readJSON(KEYS.usuarios, []);
}

export function getUsuarioPorCorreo(correo) {
  const buscado = String(correo || "").trim().toLowerCase();
  return getUsuarios().find((u) => String(u.correo).toLowerCase() === buscado) || null;
}

export function getUsuarioPorRun(run) {
  return getUsuarios().find((u) => u.run === run) || null;
}

export function guardarUsuario(usuario, correoOriginal) {
  const lista = getUsuarios();
  const clave = String(correoOriginal || usuario.correo).toLowerCase();
  const idx = lista.findIndex((u) => String(u.correo).toLowerCase() === clave);
  if (idx >= 0) lista[idx] = usuario;
  else lista.push(usuario);
  writeJSON(KEYS.usuarios, lista);
  return usuario;
}

export function eliminarUsuario(correo) {
  const buscado = String(correo || "").toLowerCase();
  writeJSON(KEYS.usuarios, getUsuarios().filter((u) => String(u.correo).toLowerCase() !== buscado));
}

/* ---------- Sesión ---------- */

export function iniciarSesion(usuario) {
  writeJSON(KEYS.sesion, { correo: usuario.correo, nombre: usuario.nombre, tipoUsuario: usuario.tipoUsuario });
}

export function cerrarSesion() {
  try { window.localStorage.removeItem(KEYS.sesion); } catch (e) { /* noop */ }
  emit();
}

export function getSesion() {
  return readJSON(KEYS.sesion, null);
}

export function esStaff(sesion) {
  return !!sesion && (sesion.tipoUsuario === "Administrador" || sesion.tipoUsuario === "Agente");
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
    marcarArrendada(tramite.propiedadId, tramite.estado === "Entregado");
  }
  return tramite;
}

export function eliminarTramite(id) {
  writeJSON(KEYS.tramites, readJSON(KEYS.tramites, []).filter((t) => t.id !== id));
}

export function nuevoIdTramite() {
  return "TR-" + Date.now();
}

/* ---------- Categorías ---------- */

export function getCategorias() {
  return readJSON(KEYS.categorias, []);
}

export function getCategoriaPorId(id) {
  return getCategorias().find((c) => c.id === id) || null;
}

export function nuevoIdCategoria(nombre) {
  const base = String(nombre || "categoria")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "categoria";
  let id = base;
  let n = 2;
  while (getCategoriaPorId(id)) { id = base + "-" + n; n++; }
  return id;
}

/* Guarda una categoría. Si cambia su nombre, se actualizan las propiedades
   que la usaban (las propiedades guardan el nombre de la categoría). */
export function guardarCategoria(categoria) {
  const anterior = getCategoriaPorId(categoria.id);
  if (anterior && anterior.nombre !== categoria.nombre) {
    const props = getPropiedades();
    props.forEach((p) => { if (p.categoria === anterior.nombre) p.categoria = categoria.nombre; });
    writeJSON(KEYS.propiedades, props, { silent: true });
  }
  return upsert(KEYS.categorias, categoria, "id") ? categoria : null;
}

/* Solo se puede eliminar una categoría que ninguna propiedad esté usando. */
export function eliminarCategoria(id) {
  const c = getCategoriaPorId(id);
  if (!c) return false;
  if (getPropiedades().some((p) => p.categoria === c.nombre)) return false;
  writeJSON(KEYS.categorias, getCategorias().filter((x) => x.id !== id));
  return true;
}

/* ---------- Órdenes (reservas pagadas o rechazadas) ---------- */

export function getOrdenes() {
  return readJSON(KEYS.ordenes, []).slice().sort(porFechaDesc);
}

export function getOrdenPorId(id) {
  return readJSON(KEYS.ordenes, []).find((o) => o.id === id) || null;
}

export function getOrdenesDeUsuario(correo) {
  const buscado = String(correo || "").toLowerCase();
  return getOrdenes().filter((o) => String(o.usuarioCorreo || o.cliente?.correo || "").toLowerCase() === buscado);
}

function siguienteNumeroOrden() {
  const nums = readJSON(KEYS.ordenes, []).map((o) => Number(o.numero) || 0);
  return Math.max(20260000, ...nums) + 1;
}

/* Crea una orden. Si quedó pagada, descuenta una unidad disponible de cada
   propiedad reservada (el "stock"). */
export function crearOrden(datos) {
  const orden = {
    ...datos,
    id: "ORD-" + Date.now(),
    numero: siguienteNumeroOrden(),
    fecha: new Date().toISOString()
  };
  const lista = readJSON(KEYS.ordenes, []);
  lista.push(orden);
  writeJSON(KEYS.ordenes, lista, { silent: true });

  if (orden.estado === "pagada") {
    const props = getPropiedades();
    orden.items.forEach((item) => {
      const p = props.find((x) => x.id === item.propiedadId);
      if (p) p.unidadesDisponibles = Math.max(0, Number(p.unidadesDisponibles || 0) - 1);
    });
    writeJSON(KEYS.propiedades, props, { silent: true });
  }
  emit();
  return orden;
}

/* Propiedades cuyo stock está en o bajo el nivel crítico definido. */
export function getPropiedadesCriticas() {
  return getPropiedades().filter((p) => {
    const critico = p.alertaDisponibilidad;
    return critico != null && Number(p.unidadesDisponibles || 0) <= Number(critico);
  });
}
