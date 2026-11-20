/* =====================================================================
   PRUEBA 15 — Acceso y menú del panel (components/AdminLayout.jsx)
   Tipo: RENDERIZADO CONDICIONAL según el ROL y PROTECCIÓN de rutas.

   ¿Qué se prueba?
   - Sin sesión, o con sesión de Cliente, el panel manda al login.
   - El Vendedor entra, pero SOLO ve Propiedades y Órdenes (el resto del
     menú no aparece, como pide la pauta).
   - El Administrador ve todo, incluido el contador de mensajes sin leer.
   - Si un Vendedor escribe a mano una ruta solo para administradores,
     vuelve al listado de propiedades (RequireAdmin).
   - Cerrar sesión borra la sesión y los tokens.
   ===================================================================== */

import { Route } from "react-router-dom";                                   // para declarar rutas
import AdminLayout, { RequireAdmin } from "../src/components/AdminLayout";      // componentes a probar
import * as store from "../src/services/store";                                 // datos
import { buscarBoton, datosDeEjemplo, hacerClick, hayTexto, iniciarSesionComo, limpiarPantalla, renderizar } from "./utils/pantalla"; // ayudantes

/* Dibuja el panel con páginas falsas para saber dónde terminamos. */
function dibujarPanel(ruta = "/admin") {
  renderizar(null, {
    ruta,                                                                    // URL inicial
    rutas: [
      <Route key="admin" path="/admin" element={<AdminLayout />}>
        <Route index element={<p>INICIO DEL PANEL</p>} />
        <Route path="usuarios" element={<RequireAdmin><p>LISTA DE USUARIOS</p></RequireAdmin>} />
        <Route path="propiedades" element={<p>LISTADO DE PROPIEDADES</p>} />
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

  it("el Vendedor entra y SOLO ve Propiedades y Órdenes en el menú", () => {
    iniciarSesionComo("vendedor@gmail.com");                                // sesión de vendedor
    dibujarPanel("/admin/propiedades");                                     // entramos
    expect(hayTexto("LISTADO DE PROPIEDADES")).toBe(true);                  // ve el panel
    const menu = enlacesDelMenu().filter((t) => !t.includes("Ver tienda")); // enlaces del panel
    expect(menu.length).toBe(2);                                            // solo dos opciones
    expect(menu.some((t) => t.includes("Propiedades"))).toBe(true);         // Propiedades
    expect(menu.some((t) => t.includes("Órdenes"))).toBe(true);             // Órdenes
    expect(menu.some((t) => t.includes("Dashboard"))).toBe(false);          // nada más
    expect(menu.some((t) => t.includes("Usuarios"))).toBe(false);
    expect(menu.some((t) => t.includes("Categorías"))).toBe(false);
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

  it("un Vendedor que entra a /admin/usuarios vuelve a Propiedades", () => {
    iniciarSesionComo("vendedor@gmail.com");                                // sesión de vendedor
    dibujarPanel("/admin/usuarios");                                        // escribe la ruta a mano
    expect(hayTexto("LISTA DE USUARIOS")).toBe(false);                      // no ve la lista
    expect(hayTexto("LISTADO DE PROPIEDADES")).toBe(true);                  // vuelve a su portada
  });

  it("cerrar sesión borra la sesión y los tokens y vuelve al login", () => {
    iniciarSesionComo("admin@duoc.cl");
    dibujarPanel();
    hacerClick(buscarBoton("Cerrar sesión"));
    expect(store.getSesion()).toBeNull();                                   // sin sesión
    expect(localStorage.getItem("aura_tokens")).toBeNull();                 // sin tokens
    expect(store.getUsuarios()).toEqual([]);                                // se borraron los datos privados de la caché
    expect(hayTexto("PÁGINA DE LOGIN")).toBe(true);
  });
});
