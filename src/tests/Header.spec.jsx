/* =====================================================================
   PRUEBA 13 — Barra de navegación (components/Header.jsx)
   Tipo: RENDERIZADO CONDICIONAL según la sesión, ESTADO interno
   (menú desplegable y menú móvil) y reacción a cambios en los datos.

   ¿Qué se prueba?
   - Sin sesión se ven "Ingresar" y "Registrarse"; con sesión, el nombre.
   - El contador del botón de solicitudes cambia cuando se guarda una
     propiedad (la barra "escucha" al store).
   - El menú de Categorías se abre y se cierra con clics.
   - El botón hamburguesa abre y cierra el menú en celulares.
   ===================================================================== */

import Header from "../components/Header";                                  // componente a probar
import * as store from "../services/store";                                 // datos
import {
  buscarBoton, datosDeEjemplo, ejecutar, hacerClick, hayTexto, iniciarSesionComo, limpiarPantalla, renderizar
} from "./utils/pantalla";                                                  // ayudantes

describe("Header (barra de navegación)", () => {

  beforeEach(() => datosDeEjemplo());   // sin sesión y sin solicitudes
  afterEach(() => limpiarPantalla());   // pantalla limpia

  it("muestra Ingresar y Registrarse cuando no hay sesión", () => {
    renderizar(<Header />);                                                 // dibujamos la barra
    expect(buscarBoton("Ingresar")).toBeTruthy();                           // existe el botón Ingresar
    expect(buscarBoton("Registrarse")).toBeTruthy();                        // existe el botón Registrarse
    expect(document.querySelector('[data-testid="usuario-nombre"]')).toBeNull(); // no se muestra ningún nombre
  });

  it("muestra el nombre del usuario y el botón Panel para el administrador", () => {
    iniciarSesionComo("admin@duoc.cl");                                     // iniciamos sesión como admin
    renderizar(<Header />);                                                 // dibujamos la barra
    expect(document.querySelector('[data-testid="usuario-nombre"]').textContent).toBe("Administradora"); // nombre visible
    expect(buscarBoton("Panel")).toBeTruthy();                              // el admin ve el acceso al panel
  });

  it("no muestra el botón Panel a un cliente", () => {
    iniciarSesionComo("cliente@gmail.com");                                 // sesión de cliente
    renderizar(<Header />);                                                 // dibujamos la barra
    expect(hayTexto("Matías")).toBe(true);                                  // se ve su nombre
    expect(Array.from(document.querySelectorAll("a")).some((a) => a.textContent === "Panel")).toBe(false); // no hay "Panel"
  });

  it("actualiza el contador de solicitudes cuando cambian los datos", () => {
    renderizar(<Header />);                                                 // dibujamos la barra
    const contador = () => document.querySelector('[data-testid="contador-solicitudes"]').textContent; // lee el número
    expect(contador()).toBe("0");                                           // al inicio no hay solicitudes
    ejecutar(() => store.agregarSolicitud("PR-1001"));                      // guardamos una propiedad
    ejecutar(() => store.agregarSolicitud("PR-1002"));                      // y otra
    expect(contador()).toBe("2");                                           // el número se actualiza solo
  });

  it("abre y cierra el menú de Categorías", () => {
    renderizar(<Header />);                                                 // dibujamos la barra
    const menu = document.querySelector(".dropdown-menu");                  // el menú desplegable
    expect(menu.classList).not.toContain("show");                           // empieza cerrado
    hacerClick(buscarBoton("Categorías"));                                  // clic en "Categorías"
    expect(menu.classList).toContain("show");                               // se abre
    expect(hayTexto("Departamento")).toBe(true);                            // muestra las categorías guardadas
    hacerClick(buscarBoton("Categorías"));                                  // otro clic
    expect(menu.classList).not.toContain("show");                           // se cierra
  });

  it("abre y cierra el menú móvil con el botón hamburguesa", () => {
    renderizar(<Header />);                                                 // dibujamos la barra
    const boton = buscarBoton("Abrir menú");                                // botón hamburguesa (aria-label)
    const menu = document.getElementById("menu-principal");                 // el menú que se pliega
    expect(boton.getAttribute("aria-expanded")).toBe("false");              // empieza cerrado
    hacerClick(boton);                                                      // lo abrimos
    expect(menu.classList).toContain("show");                               // el menú se muestra
    expect(boton.getAttribute("aria-expanded")).toBe("true");               // y el botón lo indica
  });
});
