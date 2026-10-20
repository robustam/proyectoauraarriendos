/* =====================================================================
   PRUEBA 20 — Visitas y entregas (pages/admin/Visitas.jsx)
   Tipo: ESTADO (pestañas), EVENTOS, RENDERIZADO CONDICIONAL y DATOS.

   ¿Qué se prueba?
   - Sin registros se muestra un mensaje vacío.
   - Las pestañas Todas / Visitas / Entregas filtran la lista.
   - Una visita agendada puede marcarse como realizada.
   - Confirmar una entrega marca la propiedad como ARRENDADA (regla de negocio).
   - Eliminar pide confirmación en un modal.
   ===================================================================== */

import Visitas from "../src/pages/admin/Visitas";                               // vista a probar
import * as store from "../src/services/store";                                 // datos
import {
  buscarBoton, datosDeEjemplo, ejecutar, hacerClick, hayTexto, limpiarPantalla, renderizar
} from "./utils/pantalla";                                                  // ayudantes

/* Último botón con ese texto (el del modal queda después de los de la tabla). */
function ultimoBoton(texto) {
  const botones = Array.from(document.querySelectorAll("button")).filter((b) => b.textContent.trim() === texto);
  return botones[botones.length - 1];
}

/* Una visita agendada y una entrega pendiente de ejemplo. */
function crearTramites() {
  ejecutar(() => {
    store.guardarTramite({
      id: "TR-1", tipo: "visita", propiedadId: "PR-1001", propiedadNombre: "Depto Providencia",
      clienteCorreo: "cliente@gmail.com", clienteNombre: "Matías Fernández", fecha: "2026-11-10", hora: "10:00", estado: "Agendada"
    });
    store.guardarTramite({
      id: "TR-2", tipo: "entrega", propiedadId: "PR-1005", propiedadNombre: "Studio Concepción",
      clienteCorreo: "cliente@gmail.com", clienteNombre: "Matías Fernández", fecha: "2026-11-20", hora: "", estado: "Pendiente"
    });
  });
}

describe("Visitas y entregas", () => {

  beforeEach(() => datosDeEjemplo());
  afterEach(() => limpiarPantalla());

  it("sin registros muestra el mensaje vacío", () => {
    renderizar(<Visitas />);
    expect(hayTexto("Visitas y entregas (0)")).toBe(true);
    expect(hayTexto("No hay registros en esta categoría")).toBe(true);
  });

  it("las pestañas filtran la lista por tipo", () => {
    crearTramites();
    renderizar(<Visitas />);
    expect(hayTexto("Visitas y entregas (2)")).toBe(true);                  // "Todas" muestra ambos
    hacerClick(buscarBoton("Visitas"));                                     // pestaña Visitas
    expect(hayTexto("Visitas y entregas (1)")).toBe(true);
    expect(hayTexto("Depto Providencia")).toBe(true);
    expect(hayTexto("Studio Concepción")).toBe(false);
    hacerClick(buscarBoton("Entregas"));                                    // pestaña Entregas
    expect(hayTexto("Studio Concepción")).toBe(true);
    expect(hayTexto("Depto Providencia")).toBe(false);
  });

  it("marca una visita agendada como realizada", () => {
    crearTramites();
    renderizar(<Visitas />);
    hacerClick(buscarBoton("Marcar realizada"));
    expect(store.getTramitePorId("TR-1").estado).toBe("Realizada");         // cambió en el store
    expect(hayTexto("Estado actualizado")).toBe(true);                      // aviso de éxito
    expect(document.body.textContent.includes("Marcar realizada")).toBe(false); // el botón ya no corresponde
  });

  it("confirmar una entrega marca la propiedad como arrendada", () => {
    crearTramites();
    renderizar(<Visitas />);
    expect(store.getPropiedadPorId("PR-1005").arrendada).toBeFalsy();       // antes: disponible
    hacerClick(buscarBoton("Confirmar entrega"));
    expect(store.getTramitePorId("TR-2").estado).toBe("Entregado");
    expect(store.getPropiedadPorId("PR-1005").arrendada).toBe(true);        // después: arrendada
    expect(hayTexto("Entrega confirmada. La propiedad quedó marcada como arrendada.")).toBe(true);
  });

  it("elimina un registro solo después de confirmar en el modal", () => {
    crearTramites();
    renderizar(<Visitas />);
    hacerClick(document.querySelector("tbody button.btn-danger:last-of-type")); // primer "Eliminar" de la tabla
    expect(hayTexto("¿Confirmas que deseas eliminar este registro?")).toBe(true);
    expect(store.getTramites().length).toBe(2);                             // aún no se elimina
    hacerClick(ultimoBoton("Eliminar"));                                    // confirma en el modal
    expect(store.getTramites().length).toBe(1);
  });
});
