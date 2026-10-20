/* =====================================================================
   PRUEBA 9 — Modal de confirmación (ConfirmDeleteModal en components/ui.jsx)
   Tipo: RENDERIZADO CONDICIONAL, PROPS y EVENTOS (con mocks).

   ¿Qué se prueba?
   - El modal solo aparece cuando la prop "open" es true.
   - Muestra el título y el mensaje recibidos.
   - "Eliminar" llama a onConfirm; "Cancelar", la X y la tecla Escape
     llaman a onCancel.
   ===================================================================== */

import { ConfirmDeleteModal } from "../src/components/ui";                    // componente a probar
import { buscarBoton, hacerClick, hayTexto, limpiarPantalla, presionarTecla, renderizar } from "./utils/pantalla"; // ayudantes

describe("ConfirmDeleteModal", () => {

  let alConfirmar;                       // espía para el botón Eliminar
  let alCancelar;                        // espía para cancelar

  beforeEach(() => {                     // antes de cada prueba creamos espías nuevos
    alConfirmar = jasmine.createSpy("onConfirm");
    alCancelar = jasmine.createSpy("onCancel");
  });

  afterEach(() => limpiarPantalla());    // limpiamos después de cada prueba

  /* Función de apoyo: dibuja el modal con la prop "open" indicada. */
  function dibujar(open) {
    renderizar(
      <ConfirmDeleteModal open={open} title="Eliminar usuario" message="¿Seguro?" onConfirm={alConfirmar} onCancel={alCancelar} />
    );
  }

  it("no muestra nada cuando está cerrado", () => {
    dibujar(false);                                              // open = false
    expect(document.querySelector(".modal")).toBeNull();         // no hay modal en la página
  });

  it("muestra el título y el mensaje cuando está abierto", () => {
    dibujar(true);                                               // open = true
    expect(document.querySelector(".modal.show")).not.toBeNull(); // el modal de Bootstrap está visible
    expect(hayTexto("Eliminar usuario")).toBe(true);             // con el título recibido
    expect(hayTexto("¿Seguro?")).toBe(true);                     // y el mensaje recibido
  });

  it("llama a onConfirm al presionar Eliminar", () => {
    dibujar(true);                                               // abrimos el modal
    hacerClick(buscarBoton("Eliminar"));                         // clic en Eliminar
    expect(alConfirmar).toHaveBeenCalledTimes(1);                // se confirmó una vez
    expect(alCancelar).not.toHaveBeenCalled();                   // y no se canceló
  });

  it("llama a onCancel con Cancelar, con la X y con la tecla Escape", () => {
    dibujar(true);                                               // abrimos el modal
    hacerClick(buscarBoton("Cancelar"));                         // 1) botón Cancelar
    hacerClick(buscarBoton("Cerrar"));                           // 2) la X (su aria-label es "Cerrar")
    presionarTecla("Escape");                                    // 3) tecla Escape
    expect(alCancelar).toHaveBeenCalledTimes(3);                 // las tres formas cancelan
    expect(alConfirmar).not.toHaveBeenCalled();                  // ninguna confirma
  });
});
