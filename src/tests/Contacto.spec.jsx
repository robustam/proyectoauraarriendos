/* =====================================================================
   PRUEBA 11 — Formulario de contacto (pages/Contacto.jsx)
   Tipo: ESTADO del formulario, RENDERIZADO CONDICIONAL de errores y
   EVENTOS (envío).

   ¿Qué se prueba?
   - El contador de caracteres cambia mientras se escribe (estado).
   - Enviar vacío muestra los 3 errores y NO guarda nada.
   - Un correo con dominio no permitido muestra su error.
   - Un envío correcto guarda el mensaje (llega al Inbox), limpia el
     formulario y muestra el aviso de éxito.
   ===================================================================== */

import Contacto from "../pages/Contacto";                                    // página a probar
import * as store from "../services/store";                                 // para revisar los mensajes guardados
import {
  buscarBoton, buscarCampo, datosDeEjemplo, escribir, hacerClick, hayTexto, limpiarPantalla, renderizar
} from "./utils/pantalla";                                                  // ayudantes

describe("Página de contacto", () => {

  beforeEach(() => {
    datosDeEjemplo();                     // datos limpios (Inbox vacío)
    renderizar(<Contacto />);             // dibujamos la página antes de cada prueba
  });
  afterEach(() => limpiarPantalla());     // la borramos después

  it("actualiza el contador de caracteres al escribir el mensaje", () => {
    expect(hayTexto("0 / 500")).toBe(true);                       // al inicio el contador está en 0
    escribir(buscarCampo("Mensaje"), "Hola equipo");              // escribimos 11 caracteres
    expect(hayTexto("11 / 500")).toBe(true);                      // el contador se actualiza
  });

  it("muestra los errores y no guarda nada si se envía vacío", () => {
    hacerClick(buscarBoton("Enviar mensaje"));                    // enviamos sin completar
    expect(hayTexto("Ingresa tu nombre completo (máximo 100 caracteres).")).toBe(true);      // error de nombre
    expect(hayTexto("Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com (máximo 100 caracteres).")).toBe(true); // error de correo
    expect(hayTexto("Cuéntanos tu mensaje (máximo 500 caracteres).")).toBe(true);             // error de mensaje
    expect(store.getMensajes().length).toBe(0);                   // no se guardó ningún mensaje
  });

  it("rechaza un correo con dominio no permitido mientras se escribe", () => {
    const correo = buscarCampo("Correo electrónico");             // campo de correo
    escribir(correo, "ana@hotmail.com");                          // dominio no permitido
    expect(correo.classList).toContain("is-invalid");             // el campo queda en rojo
    escribir(correo, "ana@gmail.com");                            // lo corregimos
    expect(correo.classList).toContain("is-valid");               // ahora queda en verde
  });

  it("guarda el mensaje, limpia el formulario y avisa el éxito", () => {
    escribir(buscarCampo("Nombre completo"), "Ana Pérez");        // completamos el nombre
    escribir(buscarCampo("Correo electrónico"), "ana@gmail.com"); // un correo válido
    escribir(buscarCampo("Mensaje"), "Quiero arrendar en Ñuñoa"); // y el mensaje
    hacerClick(buscarBoton("Enviar mensaje"));                    // enviamos

    const mensajes = store.getMensajes();                         // leemos el Inbox
    expect(mensajes.length).toBe(1);                              // hay un mensaje nuevo
    expect(mensajes[0].nombre).toBe("Ana Pérez");                 // con el nombre escrito
    expect(mensajes[0].leido).toBe(false);                        // y marcado como no leído
    expect(buscarCampo("Nombre completo").value).toBe("");        // el formulario quedó limpio
    expect(hayTexto("¡Gracias! Recibimos tu mensaje")).toBe(true); // se muestra el aviso de éxito
  });
});
