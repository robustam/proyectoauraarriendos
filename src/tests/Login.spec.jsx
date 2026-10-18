/* =====================================================================
   PRUEBA 12 — Inicio de sesión (pages/Login.jsx)
   Tipo: RENDERIZADO CONDICIONAL, EVENTOS y NAVEGACIÓN.

   ¿Qué se prueba?
   - El aviso informativo aparece solo si se llega con ?aviso=solicitudes.
   - Una contraseña equivocada muestra "Correo o contraseña incorrectos".
   - El administrador entra y es enviado al panel (/admin).
   - Un cliente vuelve a la página indicada en ?next=.
   Para comprobar la navegación dibujamos rutas "de mentira" que solo
   muestran un texto (por ejemplo "PANEL") al llegar a ellas.
   ===================================================================== */

import { Route } from "react-router-dom";                                   // para declarar rutas de prueba
import Login from "../pages/Login";                                         // página a probar
import * as store from "../services/store";                                 // para revisar la sesión
import {
  buscarBoton, buscarCampo, datosDeEjemplo, escribir, hacerClick, hayTexto, limpiarPantalla, renderizar
} from "./utils/pantalla";                                                  // ayudantes

/* Dibuja el login junto a dos páginas falsas para ver a dónde nos manda. */
function dibujarLogin(ruta = "/login") {
  renderizar(null, {
    ruta,                                                                   // URL inicial
    rutas: [
      <Route key="l" path="/login" element={<Login />} />,                  // la página real de login
      <Route key="a" path="/admin" element={<p>PANEL</p>} />,               // página falsa del panel
      <Route key="s" path="/solicitudes" element={<p>MIS SOLICITUDES</p>} /> // página falsa de solicitudes
    ]
  });
}

/* Completa el formulario y presiona el botón de enviar. */
function ingresar(correo, clave) {
  escribir(buscarCampo("Correo electrónico"), correo);                      // escribimos el correo
  escribir(buscarCampo("Contraseña"), clave);                               // escribimos la contraseña
  hacerClick(buscarBoton("Iniciar sesión"));                                // presionamos el botón
}

describe("Página de inicio de sesión", () => {

  beforeEach(() => datosDeEjemplo());   // datos limpios y sin sesión
  afterEach(() => limpiarPantalla());   // pantalla limpia

  it("muestra el aviso solo cuando viene desde Mis solicitudes", () => {
    dibujarLogin("/login");                                                       // llegada normal
    expect(hayTexto("Inicia sesión para guardar y enviar solicitudes")).toBe(false); // sin aviso
    limpiarPantalla();                                                            // borramos
    dibujarLogin("/login?aviso=solicitudes");                                     // llegada con aviso
    expect(hayTexto("Inicia sesión para guardar y enviar solicitudes")).toBe(true);  // ahora sí aparece
  });

  it("muestra un error con contraseña incorrecta y no inicia sesión", () => {
    dibujarLogin();                                                         // dibujamos el login
    ingresar("admin@duoc.cl", "malaclave");                                 // contraseña equivocada (4-10 caracteres)
    expect(hayTexto("Correo o contraseña incorrectos.")).toBe(true);        // aparece el error
    expect(store.getSesion()).toBeNull();                                   // no hay sesión
  });

  it("valida el formato antes de consultar los datos", () => {
    dibujarLogin();                                                         // dibujamos el login
    ingresar("admin@yahoo.com", "12");                                      // correo de dominio no permitido y clave corta
    expect(hayTexto("Correo inválido. Usa @duoc.cl, @profesor.duoc.cl o @gmail.com.")).toBe(true); // error de correo
    expect(hayTexto("La contraseña debe tener entre 4 y 10 caracteres.")).toBe(true);              // error de clave
  });

  it("envía al administrador al panel", () => {
    dibujarLogin();                                                         // dibujamos el login
    ingresar("admin@duoc.cl", "admin123");                                  // credenciales correctas
    expect(hayTexto("PANEL")).toBe(true);                                   // llegamos a la página /admin
    expect(store.getSesion().tipoUsuario).toBe("Administrador");            // la sesión quedó guardada
  });

  it("devuelve al cliente a la página indicada en ?next=", () => {
    dibujarLogin("/login?next=%2Fsolicitudes");                             // venimos desde /solicitudes
    ingresar("cliente@gmail.com", "cliente123");                            // credenciales de cliente
    expect(hayTexto("MIS SOLICITUDES")).toBe(true);                         // volvimos a /solicitudes
  });
});
