/* =====================================================================
   PRUEBA 17 — Publicar mi arriendo (pages/Publicar.jsx)
   Tipo: RENDERIZADO CONDICIONAL, ESTADO, EVENTOS y DATOS (CRUD).

   ¿Qué se prueba?
   - Sin sesión se pide iniciar sesión y no se muestra el formulario.
   - Con sesión, enviar vacío muestra errores y no guarda nada.
   - El precio de oferta debe ser menor al precio normal.
   - Una publicación válida se envía al backend (POST /productos/publicaciones,
     simulado con un espía), queda "pendiente" y aparece en "Mis publicaciones".
   - Si el backend la rechaza, se muestra su mensaje.
   - Un arrendador puede marcar su propiedad publicada como arrendada (PATCH).
   ===================================================================== */

import Publicar from "../src/pages/Publicar";                                   // página a probar
import * as store from "../src/services/store";                                 // para revisar lo guardado
import { api, ApiError } from "../src/services/api";                          // API (reemplazada por espías)
import {
  buscarBoton, buscarCampo, datosDeEjemplo, escribir, esperar, hacerClick, hayTexto,
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

  it("una publicación válida se envía al backend, queda pendiente y aparece en 'Mis publicaciones'", async () => {
    iniciarSesionComo("cliente@gmail.com");
    /* El backend (simulado) responde con la propiedad creada: id asignado y estado pendiente. */
    api.post.mockImplementation((ruta, datos) => Promise.resolve({
      ...datos, id: "PR-2002", codigo: "PR-2002", estado: "pendiente", publicadoPor: "cliente@gmail.com", arrendada: false
    }));
    renderizar(<Publicar />);
    completarFicha();
    hacerClick(buscarBoton("Enviar a revisión"));
    await esperar();

    const [ruta, datos] = api.post.mock.lastCall;                 // lo que se envió a la API
    expect(ruta).toBe("/productos/publicaciones");                          // endpoint para publicar
    expect(datos.precio).toBe(700000);                                      // los textos se convierten a números
    expect(datos.publicadoPor).toBeUndefined();                             // el publicador lo toma el backend del token
    const nueva = store.getPropiedadPorId("PR-2002");                       // quedó en la caché
    expect(nueva.estado).toBe("pendiente");                                 // espera aprobación
    expect(hayTexto("¡Listo! Tu propiedad fue enviada a revisión.")).toBe(true);
    expect(hayTexto("Casa luminosa en Ñuñoa")).toBe(true);                  // aparece en "Mis publicaciones"
    expect(buscarCampo("Título de la publicación").value).toBe("");         // el formulario se limpió
  });

  it("si el backend rechaza la publicación muestra su mensaje", async () => {
    iniciarSesionComo("cliente@gmail.com");
    api.post.mockReturnValue(Promise.reject(new ApiError("La categoría Casa no existe", 400)));
    renderizar(<Publicar />);
    completarFicha();
    hacerClick(buscarBoton("Enviar a revisión"));
    await esperar();
    expect(hayTexto("La categoría Casa no existe")).toBe(true);             // mensaje del servidor
    expect(buscarCampo("Título de la publicación").value).toBe("Casa luminosa en Ñuñoa"); // no se borró lo escrito
  });

  it("permite marcar como arrendada una propiedad ya publicada (PATCH al backend)", async () => {
    iniciarSesionComo("cliente@gmail.com");
    const propia = { ...store.getPropiedadPorId("PR-1001"), publicadoPor: "cliente@gmail.com" };
    const cache = store.getPropiedades().map((p) => (p.id === "PR-1001" ? propia : p));
    localStorage.setItem("aura_propiedades", JSON.stringify(cache));        // en la caché, PR-1001 pasa a ser del cliente
    api.patch.mockImplementation((ruta, cuerpo) => Promise.resolve({ ...propia, arrendada: cuerpo.arrendada }));
    renderizar(<Publicar />);
    hacerClick(buscarBoton("Marcar como arrendada"));                       // el arrendador la da por arrendada
    await esperar();
    expect(api.patch).toHaveBeenCalledWith("/productos/PR-1001/arrendada", { arrendada: true }); // llamada correcta
    expect(store.getPropiedadPorId("PR-1001").arrendada).toBe(true);        // se actualiza la caché
    expect(buscarBoton("Volver a publicar")).toBeTruthy();                  // el botón cambia
  });
});
