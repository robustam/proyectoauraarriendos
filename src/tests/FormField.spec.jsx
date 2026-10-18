/* =====================================================================
   PRUEBA 7 — Campo de formulario (FormField en components/ui.jsx)
   Tipo: RENDERIZADO CONDICIONAL y PROPS.

   ¿Qué se prueba?
   Tarea de la pauta: "verifica que un mensaje de error solo se muestre
   cuando hay un error presente". También que el campo reciba las clases
   de Bootstrap is-invalid / is-valid según su estado.
   ===================================================================== */

import { FormField } from "../components/ui";                               // componente a probar
import { buscarCampo, hayTexto, limpiarPantalla, renderizar } from "./utils/pantalla"; // ayudantes

describe("FormField", () => {

  afterEach(() => limpiarPantalla()); // limpiamos después de cada prueba

  it("muestra la etiqueta y la ayuda, pero NO un error si no hay error", () => {
    renderizar(
      <FormField label="Correo" htmlFor="campo-correo" hint="Usa tu correo Duoc">
        <input id="campo-correo" className="form-control" />
      </FormField>
    );                                                                      // campo sin estado de error
    expect(hayTexto("Correo")).toBe(true);                                  // se ve la etiqueta
    expect(hayTexto("Usa tu correo Duoc")).toBe(true);                      // se ve la ayuda
    expect(document.querySelector('[role="alert"]')).toBeNull();            // NO hay mensaje de error
    expect(buscarCampo("Correo").classList).not.toContain("is-invalid");    // y el campo no está en rojo
  });

  it("muestra el mensaje de error y marca el campo en rojo cuando hay error", () => {
    renderizar(
      <FormField label="Correo" htmlFor="campo-correo" status={{ error: "Correo inválido" }}>
        <input id="campo-correo" className="form-control" />
      </FormField>
    );                                                                      // campo CON error
    const alerta = document.querySelector('[role="alert"]');                // buscamos el mensaje de error
    expect(alerta.textContent).toBe("Correo inválido");                     // dice exactamente el error recibido
    const campo = buscarCampo("Correo");                                    // el input asociado a la etiqueta
    expect(campo.classList).toContain("is-invalid");                        // tiene la clase roja de Bootstrap
    expect(campo.classList).toContain("form-control");                      // y conserva su clase original
    expect(campo.getAttribute("aria-invalid")).toBe("true");                // los lectores de pantalla saben que hay error
  });

  it("marca el campo en verde cuando es válido", () => {
    renderizar(
      <FormField label="Nombre" htmlFor="campo-nombre" status={{ ok: true }}>
        <input id="campo-nombre" className="form-control" />
      </FormField>
    );                                                                      // campo válido
    expect(buscarCampo("Nombre").classList).toContain("is-valid");          // clase verde de Bootstrap
    expect(document.querySelector('[role="alert"]')).toBeNull();            // sin mensaje de error
  });
});
