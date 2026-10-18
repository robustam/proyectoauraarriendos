/* =====================================================================
   PRUEBA 3 — Capa de datos con localStorage (services/store.js)
   Tipo: pruebas de LÓGICA + uso de MOCKS (espías).

   ¿Qué se prueba?
   El archivo que simula la base de datos: crear, leer, actualizar y
   eliminar (CRUD) propiedades; la lista de solicitudes (el "carrito");
   y que una orden pagada descuente el stock.
   Con un ESPÍA (spyOn) comprobamos que los datos realmente se guardan en
   localStorage, sin cambiar cómo funciona el navegador.
   ===================================================================== */

import * as store from "../services/store"; // funciones de la capa de datos

describe("Capa de datos (store)", () => {

  beforeEach(() => {          // beforeEach se ejecuta ANTES de cada prueba
    store.reiniciarDatos();   // dejamos los datos de ejemplo limpios para que una prueba no afecte a otra
  });

  it("lee las propiedades de ejemplo", () => {
    const lista = store.getPropiedades();                    // leemos todas las propiedades
    expect(lista.length).toBe(11);                           // los datos semilla traen 11 propiedades
    expect(store.getPropiedadPorId("PR-1001").comuna).toBe("Providencia"); // buscamos una por id
    expect(store.getPropiedadPorId("NO-EXISTE")).toBeNull(); // un id inexistente devuelve null
  });

  it("crea, actualiza y elimina una propiedad (CRUD)", () => {
    const id = store.nuevoIdPropiedad();                     // pedimos un id nuevo (PR-2002)
    store.guardarPropiedad({ id, codigo: id, nombre: "Prueba", categoria: "Casa", precio: 100, estado: "pendiente" }); // CREAR
    expect(store.getPropiedadPorId(id).nombre).toBe("Prueba"); // LEER: ahora existe

    store.guardarPropiedad({ ...store.getPropiedadPorId(id), nombre: "Prueba editada" }); // ACTUALIZAR
    expect(store.getPropiedadPorId(id).nombre).toBe("Prueba editada"); // el nombre cambió
    expect(store.getPropiedades().length).toBe(12);          // sigue habiendo una sola copia (11 + 1)

    store.eliminarPropiedad(id);                             // ELIMINAR
    expect(store.getPropiedadPorId(id)).toBeNull();          // ya no existe
  });

  it("guarda los cambios en localStorage (verificado con un espía)", () => {
    const espia = spyOn(Storage.prototype, "setItem").and.callThrough(); // espiamos setItem de localStorage, pero dejamos que funcione igual
    store.agregarSolicitud("PR-1002");                       // agregamos una propiedad a "Mis solicitudes"
    expect(espia).toHaveBeenCalledWith("aura_solicitudes", JSON.stringify(["PR-1002"])); // se guardó con la clave correcta
  });

  it("no duplica propiedades en Mis solicitudes y permite quitarlas", () => {
    store.agregarSolicitud("PR-1001");                       // agregamos una propiedad
    store.agregarSolicitud("PR-1001");                       // la agregamos otra vez
    expect(store.getSolicitudes()).toEqual(["PR-1001"]);     // aparece una sola vez
    store.quitarSolicitud("PR-1001");                        // la quitamos
    expect(store.estaEnSolicitudes("PR-1001")).toBe(false);  // ya no está
  });

  it("una orden pagada descuenta una unidad de stock; una rechazada no", () => {
    const antes = store.getPropiedadPorId("PR-1003").unidadesDisponibles; // stock inicial (2)
    const item = { propiedadId: "PR-1003", nombre: "x", precio: 1 };      // un ítem de la orden

    store.crearOrden({ estado: "rechazada", items: [item], total: 1, cliente: {}, direccion: {} }); // orden rechazada
    expect(store.getPropiedadPorId("PR-1003").unidadesDisponibles).toBe(antes); // el stock NO cambia

    const orden = store.crearOrden({ estado: "pagada", items: [item], total: 1, cliente: {}, direccion: {} }); // orden pagada
    expect(store.getPropiedadPorId("PR-1003").unidadesDisponibles).toBe(antes - 1); // el stock bajó en 1
    expect(store.getOrdenPorId(orden.id).numero).toBeGreaterThan(20260003); // recibió un número de orden nuevo
  });

  it("no permite eliminar una categoría que está en uso", () => {
    expect(store.eliminarCategoria("casa")).toBe(false);      // hay casas publicadas: no se puede borrar
    store.guardarCategoria({ id: "oficina", nombre: "Oficina", descripcion: "", imagen: "" }); // creamos una categoría vacía
    expect(store.eliminarCategoria("oficina")).toBe(true);    // sin propiedades: sí se puede borrar
    expect(store.getCategoriaPorId("oficina")).toBeNull();    // y ya no existe
  });

  it("lista las propiedades en stock crítico", () => {
    const criticas = store.getPropiedadesCriticas().map((p) => p.id); // ids de las propiedades críticas
    expect(criticas).toContain("PR-1002");                    // PR-1002 tiene 1 unidad y su alerta es 1
    expect(criticas).not.toContain("PR-1001");                // PR-1001 tiene 3 unidades y alerta 1: no es crítica
  });
});
