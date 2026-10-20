/* =====================================================================
   PRUEBA 8 — Botón "Agregar a mis solicitudes" (components/FavoritoButton.jsx)
   Tipo: PROPS y EVENTOS.

   ¿Qué se prueba?
   Tarea de la pauta: "asegúrate de que un componente de botón recibe
   correctamente la etiqueta y la función de evento onClick".
   ===================================================================== */

import FavoritoButton from "../src/components/FavoritoButton";                  // componente a probar
import { hacerClick, limpiarPantalla, renderizar } from "./utils/pantalla"; // ayudantes

describe("FavoritoButton", () => {

  afterEach(() => limpiarPantalla()); // limpiamos después de cada prueba

  it("muestra la etiqueta según la prop 'guardada'", () => {
    renderizar(<FavoritoButton guardada={false} onClick={() => {}} />);       // aún no guardada
    expect(document.querySelector("button").textContent).toBe("♡ Agregar a mis solicitudes"); // texto para agregar
    limpiarPantalla();                                                        // borramos

    renderizar(<FavoritoButton guardada={true} onClick={() => {}} />);        // ya guardada
    const boton = document.querySelector("button");                           // el botón dibujado
    expect(boton.textContent).toBe("♥ En mis solicitudes");                   // texto de guardada
    expect(boton.classList).toContain("btn-accent");                          // cambia de color
  });

  it("ejecuta la función onClick recibida al hacer clic", () => {
    const alHacerClick = jasmine.createSpy("onClick");                        // función espía
    renderizar(<FavoritoButton onClick={alHacerClick} />);                    // se la pasamos por props
    hacerClick(document.querySelector("button"));                             // clic en el botón
    hacerClick(document.querySelector("button"));                             // otro clic
    expect(alHacerClick).toHaveBeenCalledTimes(2);                            // se llamó dos veces
  });

  it("no ejecuta onClick cuando está deshabilitado", () => {
    const alHacerClick = jasmine.createSpy("onClick");                        // función espía
    renderizar(<FavoritoButton onClick={alHacerClick} disabled />);           // botón deshabilitado
    hacerClick(document.querySelector("button"));                             // intentamos hacer clic
    expect(alHacerClick).not.toHaveBeenCalled();                              // no se llamó
  });
});
