/* =====================================================================
   PRUEBA 6 — Grilla de propiedades (components/PropertyGrid.jsx)
   Tipo: pruebas de RENDERIZADO de listas y RENDERIZADO CONDICIONAL.

   ¿Qué se prueba?
   - Que la grilla dibuje UNA tarjeta por cada propiedad de la lista
     (tarea de la pauta: "los componentes de lista renderizan todos los
     elementos de un conjunto de datos").
   - Que si la lista está vacía muestre el mensaje correspondiente.
   - Que use las columnas responsivas de Bootstrap.
   ===================================================================== */

import PropertyGrid from "../src/components/PropertyGrid";                     // componente a probar
import * as store from "../src/services/store";                                // datos de ejemplo
import { datosDeEjemplo, hayTexto, limpiarPantalla, renderizar } from "./utils/pantalla"; // ayudantes

describe("PropertyGrid", () => {

  beforeEach(() => datosDeEjemplo());   // antes de cada prueba: datos limpios
  afterEach(() => limpiarPantalla());   // después de cada prueba: pantalla limpia

  it("dibuja una tarjeta por cada propiedad de la lista", () => {
    const propiedades = store.getPropiedades().slice(0, 4);                  // tomamos 4 propiedades de ejemplo
    renderizar(<PropertyGrid propiedades={propiedades} />);                  // dibujamos la grilla
    const tarjetas = document.querySelectorAll(".property-card");            // buscamos todas las tarjetas
    expect(tarjetas.length).toBe(4);                                         // hay exactamente 4
    propiedades.forEach((p) => expect(hayTexto(p.nombre)).toBe(true));       // y aparece el nombre de cada una
  });

  it("muestra el mensaje de lista vacía cuando no hay propiedades", () => {
    renderizar(<PropertyGrid propiedades={[]} />);                           // lista vacía
    expect(document.querySelectorAll(".property-card").length).toBe(0);      // ninguna tarjeta
    expect(hayTexto("No hay propiedades para mostrar")).toBe(true);          // mensaje por defecto
  });

  it("permite personalizar el mensaje vacío con la prop 'vacio'", () => {
    renderizar(<PropertyGrid propiedades={[]} vacio={<p>Sin ofertas hoy</p>} />); // mensaje propio
    expect(hayTexto("Sin ofertas hoy")).toBe(true);                          // se muestra el mensaje recibido
  });

  it("usa las columnas responsivas de Bootstrap", () => {
    renderizar(<PropertyGrid propiedades={store.getPropiedades().slice(0, 2)} columnas={4} />); // pedimos 4 columnas
    const fila = document.querySelector(".row");                              // la fila de Bootstrap
    expect(fila.classList).toContain("row-cols-1");                           // 1 columna en celular
    expect(fila.classList).toContain("row-cols-sm-2");                        // 2 en tablet
    expect(fila.classList).toContain("row-cols-xl-4");                        // 4 en pantallas grandes
  });
});
