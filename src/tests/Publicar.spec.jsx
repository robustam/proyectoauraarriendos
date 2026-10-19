/* =====================================================================
   PRUEBA 17 — Publicar mi arriendo (pages/Publicar.jsx)
   Tipo: RENDERIZADO CONDICIONAL, ESTADO, EVENTOS y DATOS (CRUD).

   ¿Qué se prueba?
   - Sin sesión se pide iniciar sesión y no se muestra el formulario.
   - Con sesión, enviar vacío muestra errores y no guarda nada.
   - El precio de oferta debe ser menor al precio normal.
   - Una publicación válida se guarda como "pendiente" (a la espera de que
     un Administrador o Agente la apruebe) y aparece en "Mis publicaciones".
   - Un arrendador puede marcar su propiedad publicada como arrendada.
   ===================================================================== */

import Publicar from "../pages/Publicar";                                   // página a probar
import * as store from "../services/store";                                 // para revisar lo guardado
import {
  buscarBoton, buscarCampo, datosDeEjemplo, ejecutar, escribir, hacerClick, hayTexto,
  iniciarSesionComo, limpiarPantalla, renderizar, seleccionar
} from "./utils/pantalla";                                                  // ayudantes

/* Completa la ficha con datos válidos. */
function completarFicha() {
  seleccionar(buscarCampo("Tipo de inmueble"), "Casa");
  escribir(buscarCampo("Título de la publicación"), "Casa luminosa en Ñuñoa");
  seleccionar(buscarCampo("Región"), "Región Metropolitana de Santiago");
  seleccionar(buscarCampo("Comuna"), "Ñuñoa");
  escribir(buscarCampo("Dirección"), "Calle Suecia 100");
  escribir(buscarCampo("Precio mensual (CLP)"), "700000");
  escribir(buscarCampo("Superficie (m²)"), "90");
}

describe("Publicar mi arriendo", () => {

  beforeEach(() => datosDeEjemplo());   // datos limpios y sin sesión
  afterEach(() => limpiarPantalla());   // pantalla limpia

  it("sin sesión pide iniciar sesión y no muestra el formulario", () => {
    renderizar(<Publicar />);
    expect(hayTexto("Inicia sesión para publicar")).toBe(true);             // mensaje para entrar
    expect(buscarBoton("Crear cuenta")).toBeTruthy();                       // y opción de registrarse
    expect(document.querySelector("form")).toBeNull();                      // no hay formulario
  });

  it("con sesión, enviar vacío muestra errores y no guarda nada", () => {
    iniciarSesionComo("cliente@gmail.com");
    renderizar(<Publicar />);
    const antes = store.getPropiedades().length;
    hacerClick(buscarBoton("Enviar a revisión"));                           // enviamos sin completar
    expect(hayTexto("Revisa los campos marcados en rojo.")).toBe(true);
    expect(hayTexto("Selecciona un tipo de inmueble.")).toBe(true);
    expect(store.getPropiedades().length).toBe(antes);                      // no se creó nada
  });

  it("exige que el precio de oferta sea menor al precio normal", () => {
    iniciarSesionComo("cliente@gmail.com");
    renderizar(<Publicar />);
    escribir(buscarCampo("Precio mensual (CLP)"), "500000");
    escribir(buscarCampo("Precio de oferta (opcional)"), "600000");         // oferta mayor al precio
    expect(hayTexto("La oferta debe ser menor al precio normal.")).toBe(true);
    escribir(buscarCampo("Precio de oferta (opcional)"), "450000");         // oferta válida
    expect(hayTexto("La oferta debe ser menor al precio normal.")).toBe(false);
  });

  it("una publicación válida queda pendiente y aparece en 'Mis publicaciones'", () => {
    iniciarSesionComo("cliente@gmail.com");
    renderizar(<Publicar />);
    completarFicha();
    hacerClick(buscarBoton("Enviar a revisión"));

    const nueva = store.getPropiedadPorId("PR-2002");                       // el id siguiente al mayor existente (PR-2001)
    expect(nueva).toBeTruthy();
    expect(nueva.estado).toBe("pendiente");                                 // espera aprobación
    expect(nueva.publicadoPor).toBe("cliente@gmail.com");                   // queda a nombre de quien publica
    expect(nueva.precio).toBe(700000);                                      // los textos se convierten a números
    expect(hayTexto("¡Listo! Tu propiedad fue enviada a revisión.")).toBe(true);
    expect(hayTexto("Casa luminosa en Ñuñoa")).toBe(true);                  // aparece en "Mis publicaciones"
    expect(buscarCampo("Título de la publicación").value).toBe("");         // el formulario se limpió
  });

  it("permite marcar como arrendada una propiedad ya publicada", () => {
    iniciarSesionComo("cliente@gmail.com");
    ejecutar(() => store.guardarPropiedad({ ...store.getPropiedadPorId("PR-1001"), publicadoPor: "cliente@gmail.com" })); // PR-1001 pasa a ser del cliente
    renderizar(<Publicar />);
    hacerClick(buscarBoton("Marcar como arrendada"));                       // el arrendador la da por arrendada
    expect(store.getPropiedadPorId("PR-1001").arrendada).toBe(true);        // se guarda en el store
    expect(buscarBoton("Volver a publicar")).toBeTruthy();                  // el botón cambia
  });
});
