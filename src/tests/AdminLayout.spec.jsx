/* =====================================================================
   PRUEBA 15 — Acceso y menú del panel (components/AdminLayout.jsx)
   Tipo: RENDERIZADO CONDICIONAL según el ROL y PROTECCIÓN de rutas.

   ¿Qué se prueba?
   - Sin sesión, o con sesión de Cliente, el panel manda al login.
   - El Agente entra, pero NO ve Usuarios, Blog, Inbox ni Categorías.
   - El Administrador ve todo, incluido el contador de mensajes sin leer.
   - Si un Agente escribe a mano una ruta solo para administradores,
     vuelve al dashboard (RequireAdmin).
   ===================================================================== */

import { Route } from "react-router-dom";                                   // para declarar rutas
import AdminLayout, { RequireAdmin } from "../components/AdminLayout";      // componentes a probar
import * as store from "../services/store";                                 // datos
import { datosDeEjemplo, hayTexto, iniciarSesionComo, limpiarPantalla, renderizar } from "./utils/pantalla"; // ayudantes

/* Dibuja el panel con páginas falsas para saber dónde terminamos. */
function dibujarPanel(ruta = "/admin") {
  renderizar(null, {
    ruta,                                                                    // URL inicial
    rutas: [
      <Route key="admin" path="/admin" element={<AdminLayout />}>
        <Route index element={<p>INICIO DEL PANEL</p>} />
        <Route path="usuarios" element={<RequireAdmin><p>LISTA DE USUARIOS</p></RequireAdmin>} />
      </Route>,
      <Route key="login" path="/login" element={<p>PÁGINA DE LOGIN</p>} />
    ]
  });
}

/* Devuelve los textos de los enlaces del menú lateral. */
const enlacesDelMenu = () => Array.from(document.querySelectorAll(".admin-sidebar .nav-link")).map((a) => a.textContent.trim());

describe("AdminLayout (acceso al panel)", () => {

  beforeEach(() => datosDeEjemplo());   // datos limpios y sin sesión
  afterEach(() => limpiarPantalla());   // pantalla limpia

  it("sin sesión redirige al login", () => {
    dibujarPanel();                                                         // intentamos entrar
    expect(hayTexto("PÁGINA DE LOGIN")).toBe(true);                         // terminamos en el login
  });

  it("un Cliente tampoco puede entrar", () => {
    iniciarSesionComo("cliente@gmail.com");                                 // sesión de cliente
    dibujarPanel();                                                         // intentamos entrar
    expect(hayTexto("PÁGINA DE LOGIN")).toBe(true);                         // también va al login
  });

  it("el Agente entra pero no ve las secciones del Administrador", () => {
    iniciarSesionComo("agentearriendo@gmail.com");                          // sesión de agente
    dibujarPanel();                                                         // entramos
    expect(hayTexto("INICIO DEL PANEL")).toBe(true);                        // ve el panel
    const menu = enlacesDelMenu();                                          // enlaces visibles
    expect(menu.some((t) => t.includes("Propiedades"))).toBe(true);         // sí ve Propiedades
    expect(menu.some((t) => t.includes("Usuarios"))).toBe(false);           // no ve Usuarios
    expect(menu.some((t) => t.includes("Inbox"))).toBe(false);              // no ve Inbox
    expect(menu.some((t) => t.includes("Categorías"))).toBe(false);         // no ve Categorías
  });

  it("el Administrador ve todo y el contador de mensajes sin leer", () => {
    store.guardarMensaje({ nombre: "Ana", correo: "ana@gmail.com", comentario: "Hola" }); // llega un mensaje nuevo
    iniciarSesionComo("admin@duoc.cl");                                     // sesión de administrador
    dibujarPanel();                                                         // entramos
    const menu = enlacesDelMenu();                                          // enlaces visibles
    expect(menu.some((t) => t.includes("Usuarios"))).toBe(true);            // ve Usuarios
    expect(menu.find((t) => t.includes("Inbox"))).toContain("1");           // Inbox muestra 1 sin leer
    expect(document.querySelector('[data-testid="admin-nombre"]').textContent).toBe("Administradora"); // su nombre en el menú
  });

  it("un Agente que entra a /admin/usuarios vuelve al dashboard", () => {
    iniciarSesionComo("agentearriendo@gmail.com");                          // sesión de agente
    dibujarPanel("/admin/usuarios");                                        // escribe la ruta a mano
    expect(hayTexto("LISTA DE USUARIOS")).toBe(false);                      // no ve la lista
    expect(hayTexto("INICIO DEL PANEL")).toBe(true);                        // vuelve al inicio del panel
  });
});
