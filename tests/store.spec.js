/* =====================================================================
   PRUEBA 3 — Capa de datos (services/store.js)
   Tipo: pruebas de LÓGICA + uso de MOCKS (espías).

   Desde la EP3 los datos viven en el backend. El store guarda una CACHÉ
   local y llama a la API para crear, editar y eliminar.
   En las pruebas reemplazamos la API con espías (api.get, api.post, ...)
   para simular las respuestas del servidor sin necesitarlo.

   ¿Qué se prueba?
   - Lectura de la caché (datos de ejemplo).
   - CRUD de propiedades: cada acción llama al endpoint correcto y actualiza la caché.
   - Si el backend rechaza una acción, el error llega con su mensaje y la caché no cambia.
   - La sincronización trae datos distintos según el rol.
   - Al recargar, la sesión se valida con /auth/me.
   - El carrito de solicitudes sigue en localStorage.
   ===================================================================== */

import * as store from "../src/services/store"; // funciones de la capa de datos
import { api, ApiError } from "../src/services/api"; // API (reemplazada por espías)
import { datosDeEjemplo, iniciarSesionComo } from "./utils/pantalla"; // datos limpios + espías de la API

describe("Capa de datos (store)", () => {

  beforeEach(() => {
    datosDeEjemplo();   // caché con datos de ejemplo, sin sesión y API simulada "sin servidor"
  });

  it("lee las propiedades de la caché", () => {
    const lista = store.getPropiedades();                    // leemos todas las propiedades
    expect(lista.length).toBe(11);                           // los datos de ejemplo traen 11 propiedades
    expect(store.getPropiedadPorId("PR-1001").comuna).toBe("Providencia"); // buscamos una por id
    expect(store.getPropiedadPorId("NO-EXISTE")).toBeNull(); // un id inexistente devuelve null
  });

  it("crea, actualiza y elimina una propiedad llamando a la API (CRUD)", async () => {
    api.post.and.callFake((ruta, datos) => Promise.resolve({ ...datos, id: "PR-2002" }));   // el backend asigna el id
    const creada = await store.crearPropiedad({ nombre: "Prueba", categoria: "Casa", precio: 100 }); // CREAR
    expect(api.post).toHaveBeenCalledWith("/productos", jasmine.objectContaining({ nombre: "Prueba" }));
    expect(store.getPropiedadPorId(creada.id).nombre).toBe("Prueba");                     // LEER: quedó en la caché

    api.put.and.callFake((ruta, datos) => Promise.resolve({ ...datos, id: "PR-2002" }));
    await store.actualizarPropiedad("PR-2002", { nombre: "Prueba editada" });              // ACTUALIZAR
    expect(api.put).toHaveBeenCalledWith("/productos/PR-2002", { nombre: "Prueba editada" });
    expect(store.getPropiedadPorId("PR-2002").nombre).toBe("Prueba editada");
    expect(store.getPropiedades().length).toBe(12);                                        // una sola copia (11 + 1)

    api.del.and.returnValue(Promise.resolve(null));
    await store.eliminarPropiedad("PR-2002");                                              // ELIMINAR
    expect(api.del).toHaveBeenCalledWith("/productos/PR-2002");
    expect(store.getPropiedadPorId("PR-2002")).toBeNull();
  });

  it("si el backend rechaza la acción, lanza su mensaje y no cambia la caché", async () => {
    api.del.and.returnValue(Promise.reject(new ApiError("La propiedad PR-1005 tiene boletas asociadas", 409)));
    let error = null;
    try {
      await store.eliminarPropiedad("PR-1005");
    } catch (e) {
      error = e;
    }
    expect(error.estado).toBe(409);                                       // código HTTP del backend
    expect(error.message).toContain("tiene boletas asociadas");           // mensaje listo para mostrar
    expect(store.getPropiedadPorId("PR-1005")).toBeTruthy();              // la propiedad sigue en la caché
  });

  it("la moderación usa PATCH /productos/{id}/estado", async () => {
    api.patch.and.callFake((ruta, cuerpo) => Promise.resolve({ ...store.getPropiedadPorId("PR-2001"), estado: cuerpo.estado, motivoRechazo: cuerpo.motivo }));
    await store.cambiarEstadoPropiedad("PR-2001", "rechazada", "Fotos borrosas");
    expect(api.patch).toHaveBeenCalledWith("/productos/PR-2001/estado", { estado: "rechazada", motivo: "Fotos borrosas" });
    expect(store.getPropiedadPorId("PR-2001").estado).toBe("rechazada");
  });

  it("guarda el carrito en localStorage (verificado con un espía)", () => {
    const espia = spyOn(Storage.prototype, "setItem").and.callThrough(); // espiamos setItem de localStorage
    store.agregarSolicitud("PR-1002");                       // agregamos una propiedad a "Mis solicitudes"
    expect(espia).toHaveBeenCalledWith("aura_solicitudes", JSON.stringify(["PR-1002"])); // se guardó con la clave correcta
  });

  it("no duplica propiedades en Mis solicitudes y permite quitarlas", () => {
    store.agregarSolicitud("PR-1001");
    store.agregarSolicitud("PR-1001");
    expect(store.getSolicitudes()).toEqual(["PR-1001"]);
    store.quitarSolicitud("PR-1001");
    expect(store.estaEnSolicitudes("PR-1001")).toBe(false);
  });

  it("pagarReserva envía la reserva al backend y guarda la boleta en la caché", async () => {
    iniciarSesionComo("cliente@gmail.com");
    api.post.and.returnValue(Promise.resolve({ id: 7, numero: 20260010, estado: "pagada", items: [], total: 650000, fecha: "2030-01-01T10:00:00" }));
    const boleta = await store.pagarReserva({ propiedadIds: ["PR-1001"] });
    expect(api.post).toHaveBeenCalledWith("/boletas", { propiedadIds: ["PR-1001"] });
    expect(store.getOrdenPorId("7").numero).toBe(20260010);  // los ids del backend son números: se compara como texto
    expect(boleta.estado).toBe("pagada");
  });

  it("sincroniza según el rol: el público no pide usuarios ni boletas", async () => {
    api.get.and.returnValue(Promise.resolve([]));
    await store.sincronizar();
    const rutas = api.get.calls.allArgs().map((a) => a[0]);
    expect(rutas).toContain("/productos");                   // catálogo público
    expect(rutas).toContain("/categorias");
    expect(rutas).not.toContain("/usuarios");
    expect(rutas.some((r) => r.startsWith("/boletas"))).toBe(false);
  });

  it("sincroniza según el rol: el administrador pide todo", async () => {
    iniciarSesionComo("admin@duoc.cl");
    api.get.and.returnValue(Promise.resolve([]));
    await store.sincronizar();
    const rutas = api.get.calls.allArgs().map((a) => a[0]);
    expect(rutas).toEqual(jasmine.arrayContaining(["/productos/todos", "/categorias", "/usuarios", "/boletas"]));
  });

  it("sincroniza según el rol: el cliente pide solo SUS boletas y publicaciones", async () => {
    iniciarSesionComo("cliente@gmail.com");
    api.get.and.returnValue(Promise.resolve([]));
    await store.sincronizar();
    const rutas = api.get.calls.allArgs().map((a) => a[0]);
    expect(rutas).toContain("/boletas/usuario/cliente%40gmail.com");
    expect(rutas).toContain("/productos/publicador/cliente%40gmail.com");
    expect(rutas).not.toContain("/boletas");
  });

  it("al recargar valida la sesión con /auth/me y la cierra si el token ya no sirve", async () => {
    iniciarSesionComo("cliente@gmail.com");
    api.get.and.callFake((ruta) => ruta === "/auth/me"
      ? Promise.reject(new ApiError("La sesión expiró", 401))
      : Promise.resolve([]));
    await store.restaurarSesion();
    expect(store.getSesion()).toBeNull();                    // la sesión se borró
    expect(localStorage.getItem("aura_tokens")).toBeNull();  // y también los tokens
  });

  it("al recargar con un token válido mantiene la sesión con los datos del backend", async () => {
    iniciarSesionComo("cliente@gmail.com");
    api.get.and.callFake((ruta) => ruta === "/auth/me"
      ? Promise.resolve({ id: 3, correo: "cliente@gmail.com", nombre: "Matías", tipoUsuario: "Cliente" })
      : Promise.resolve([]));
    await store.restaurarSesion();
    expect(store.getSesion().id).toBe(3);                    // datos frescos del servidor
  });

  it("lista las propiedades en stock crítico", () => {
    const criticas = store.getPropiedadesCriticas().map((p) => p.id);
    expect(criticas).toContain("PR-1002");                   // PR-1002 tiene 1 unidad y su alerta es 1
    expect(criticas).not.toContain("PR-1001");               // PR-1001 tiene 3 unidades y alerta 1: no es crítica
  });

  it("reconoce los roles del panel", () => {
    expect(store.esStaff({ tipoUsuario: "Administrador" })).toBe(true);
    expect(store.esStaff({ tipoUsuario: "Vendedor" })).toBe(true);
    expect(store.esStaff({ tipoUsuario: "Cliente" })).toBe(false);
    expect(store.esAdmin({ tipoUsuario: "Vendedor" })).toBe(false);
  });
});
