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
import Login from "../src/pages/Login";                                         // página a probar
import * as store from "../src/services/store";                                 // para revisar la sesión
import { api, ApiError } from "../src/services/api";                          // API (reemplazada por espías)
import { USUARIOS } from "../src/services/manifest";                          // cuentas de ejemplo
import {
  buscarBoton, buscarCampo, datosDeEjemplo, escribir, esperar, hacerClick, hayTexto, limpiarPantalla, renderizar
} from "./utils/pantalla";                                                  // ayudantes

/* Backend simulado de /auth/login: responde como el real (tokens + usuario sin clave) o 401. */
function backendDeLogin(ruta, { correo, clave }) {
  const u = USUARIOS.find((x) => x.correo === correo && x.clave === clave);
  if (!u) return Promise.reject(new ApiError("Correo o contraseña incorrectos", 401));
  const { clave: _omitida, ...usuario } = u;
  return Promise.resolve({ accessToken: "acceso-" + correo, refreshToken: "refresh-" + correo, tipo: "Bearer", expiraEn: 900, usuario });
}

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

  beforeEach(() => {
    datosDeEjemplo();                          // datos limpios y sin sesión
    api.post.mockImplementation(backendDeLogin);     // el "backend" valida las credenciales
  });
  afterEach(() => limpiarPantalla());   // pantalla limpia

  it("muestra el aviso solo cuando viene desde Mis solicitudes", () => {
    dibujarLogin("/login");                                                       // llegada normal
    expect(hayTexto("Inicia sesión para guardar y enviar solicitudes")).toBe(false); // sin aviso
    limpiarPantalla();                                                            // borramos
    dibujarLogin("/login?aviso=solicitudes");                                     // llegada con aviso
    expect(hayTexto("Inicia sesión para guardar y enviar solicitudes")).toBe(true);  // ahora sí aparece
  });

  it("muestra un error con contraseña incorrecta y no inicia sesión", async () => {
    dibujarLogin();                                                         // dibujamos el login
    ingresar("admin@duoc.cl", "malaclave");                                 // contraseña equivocada (4-10 caracteres)
    await esperar();                                                        // respuesta 401 del backend
    expect(hayTexto("Correo o contraseña incorrectos.")).toBe(true);        // aparece el error
    expect(store.getSesion()).toBeNull();                                   // no hay sesión
  });

  it("valida el formato antes de consultar los datos", () => {
    dibujarLogin();                                                         // dibujamos el login
    ingresar("admin@yahoo.com", "12");                                      // correo de dominio no permitido y clave corta
    expect(hayTexto("Correo inválido. Usa @duoc.cl, @profesor.duoc.cl o @gmail.com.")).toBe(true); // error de correo
    expect(hayTexto("La contraseña debe tener entre 4 y 10 caracteres.")).toBe(true);              // error de clave
    expect(api.post).not.toHaveBeenCalled();                                // no se consultó al backend
  });

  it("envía al administrador al panel y guarda los tokens JWT", async () => {
    dibujarLogin();                                                         // dibujamos el login
    ingresar("admin@duoc.cl", "admin123");                                  // credenciales correctas
    await esperar();
    expect(api.post).toHaveBeenCalledWith("/auth/login", { correo: "admin@duoc.cl", clave: "admin123" }); // se consultó al backend
    expect(hayTexto("PANEL")).toBe(true);                                   // llegamos a la página /admin
    expect(store.getSesion().tipoUsuario).toBe("Administrador");            // la sesión quedó guardada
    expect(store.getSesion().clave).toBeUndefined();                        // la contraseña nunca se guarda en el navegador
    expect(JSON.parse(localStorage.getItem("aura_tokens")).accessToken).toBe("acceso-admin@duoc.cl"); // token para las llamadas
  });

  it("envía al vendedor al panel", async () => {
    dibujarLogin();
    ingresar("vendedor@gmail.com", "vende123");
    await esperar();
    expect(hayTexto("PANEL")).toBe(true);
    expect(store.getSesion().tipoUsuario).toBe("Vendedor");
  });

  it("devuelve al cliente a la página indicada en ?next=", async () => {
    dibujarLogin("/login?next=%2Fsolicitudes");                             // venimos desde /solicitudes
    ingresar("cliente@gmail.com", "cliente123");                            // credenciales de cliente
    await esperar();
    expect(hayTexto("MIS SOLICITUDES")).toBe(true);                         // volvimos a /solicitudes
  });
});
