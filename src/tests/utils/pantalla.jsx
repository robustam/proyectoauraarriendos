/* =====================================================================
   Herramientas para las pruebas (helper).

   Las pruebas necesitan: dibujar un componente en una página de prueba,
   buscar textos, botones y campos, y simular lo que haría una persona
   (escribir, hacer clic, elegir una opción). Este archivo reúne todo eso
   con nombres en español para que cualquier prueba se lea como una receta.

   Usa solo React y el DOM del navegador; no requiere librerías extra.
   ===================================================================== */

import { act } from "react";                         // "act" espera a que React termine de actualizar la pantalla
import { createRoot } from "react-dom/client";       // createRoot dibuja un componente dentro de un elemento HTML
import { MemoryRouter, Routes } from "react-router-dom"; // MemoryRouter: navegación en memoria (sin cambiar la URL real)
import { ToastProvider } from "../../context/ToastContext"; // proveedor de las notificaciones que usan los componentes
import * as store from "../../services/store";      // capa de datos (localStorage)

/* Le avisamos a React que estamos en un entorno de pruebas, así "act" funciona sin advertencias. */
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/* Lista de componentes dibujados en la prueba actual, para poder borrarlos al final. */
let montados = [];

/* ---------------------------------------------------------------------
   renderizar(componente, opciones)
   Dibuja el componente dentro de un <div> nuevo en la página.
   - ruta: URL inicial simulada (por defecto "/").
   - rutas: si se entregan <Route>, se dibujan dentro de <Routes> para
     poder probar navegación entre páginas.
   Devuelve el <div> contenedor por si se necesita buscar dentro de él.
   --------------------------------------------------------------------- */
export function renderizar(componente, { ruta = "/", rutas = null } = {}) {
  const contenedor = document.createElement("div");   // creamos un <div> vacío
  document.body.appendChild(contenedor);               // lo agregamos a la página de pruebas
  const raiz = createRoot(contenedor);                 // preparamos React para dibujar dentro del <div>
  act(() => {                                          // act: dibuja y espera a que todo quede listo
    raiz.render(
      <MemoryRouter initialEntries={[ruta]}>
        <ToastProvider>
          {rutas ? <Routes>{rutas}</Routes> : componente}
        </ToastProvider>
      </MemoryRouter>
    );
  });
  montados.push({ raiz, contenedor });                 // guardamos el componente para limpiarlo después
  return contenedor;                                   // devolvemos el <div> por si se quiere usar
}

/* Borra de la página todo lo que se dibujó (se llama en afterEach). */
export function limpiarPantalla() {
  montados.forEach(({ raiz, contenedor }) => {         // para cada componente dibujado...
    act(() => raiz.unmount());                         // ...le pedimos a React que lo desmonte
    contenedor.remove();                               // ...y quitamos su <div> de la página
  });
  montados = [];                                       // dejamos la lista vacía para la próxima prueba
}

/* Ejecuta una acción que cambia datos (por ejemplo, guardar en el store)
   y espera a que la pantalla se actualice. */
export function ejecutar(accion) {
  let resultado;                                       // aquí guardamos lo que devuelva la acción
  act(() => { resultado = accion(); });                // la ejecutamos dentro de act
  return resultado;                                    // y devolvemos su resultado
}

/* Deja los datos como recién instalados y sin sesión iniciada. */
export function datosDeEjemplo() {
  store.reiniciarDatos();                              // borra localStorage y vuelve a cargar los datos semilla
}

/* Inicia sesión directamente (sin pasar por el formulario) con un usuario existente. */
export function iniciarSesionComo(correo) {
  const usuario = store.getUsuarioPorCorreo(correo);   // buscamos el usuario por su correo
  store.iniciarSesion(usuario);                        // y lo guardamos como sesión activa
  return usuario;                                      // lo devolvemos por si la prueba lo necesita
}

/* ---------------------- Búsquedas en la pantalla ---------------------- */

/* Quita espacios repetidos para comparar textos sin problemas. */
const normalizar = (t) => String(t || "").replace(/\s+/g, " ").trim();

/* Devuelve los elementos cuyo texto completo es exactamente `texto`
   (el más interno, para no devolver también a sus "padres"). */
export function todosConTexto(texto) {
  const buscado = normalizar(texto);                                     // texto que queremos encontrar
  const todos = Array.from(document.body.querySelectorAll("*"));         // todos los elementos de la página
  const coinciden = todos.filter((el) => normalizar(el.textContent) === buscado); // los que tienen ese texto
  return coinciden.filter((el) => !coinciden.some((otro) => otro !== el && el.contains(otro))); // solo los más internos
}

/* Busca UN elemento por su texto. Si no existe, la prueba falla con un mensaje claro. */
export function buscarTexto(texto) {
  const encontrados = todosConTexto(texto);                              // buscamos coincidencias exactas
  if (!encontrados.length) throw new Error('No se encontró el texto: "' + texto + '"'); // si no hay, avisamos
  return encontrados[0];                                                 // devolvemos el primero
}

/* ¿Aparece este texto en alguna parte de la pantalla? (true / false) */
export function hayTexto(texto) {
  return normalizar(document.body.textContent).includes(normalizar(texto)); // revisa si el texto está contenido
}

/* Busca un campo de formulario por el texto de su etiqueta <label>. */
export function buscarCampo(etiqueta) {
  const label = Array.from(document.querySelectorAll("label"))           // todas las etiquetas
    .find((l) => normalizar(l.textContent) === normalizar(etiqueta));    // la que dice exactamente eso
  if (!label) throw new Error('No se encontró la etiqueta: "' + etiqueta + '"'); // si no existe, avisamos
  const campo = document.getElementById(label.htmlFor);                  // el campo al que apunta (atributo for)
  if (!campo) throw new Error('La etiqueta "' + etiqueta + '" no apunta a ningún campo'); // por si falta el id
  return campo;                                                          // devolvemos el input/select/textarea
}

/* Busca un botón (o enlace) por su texto visible o por su aria-label. */
export function buscarBoton(nombre) {
  const candidatos = Array.from(document.querySelectorAll("button, a"));  // todos los botones y enlaces
  const boton = candidatos.find((b) =>
    normalizar(b.textContent) === normalizar(nombre) || b.getAttribute("aria-label") === nombre); // por texto o aria-label
  if (!boton) throw new Error('No se encontró el botón: "' + nombre + '"');// si no existe, avisamos
  return boton;                                                          // devolvemos el botón
}

/* ---------------------- Acciones de una persona ----------------------- */

/* Hace clic en un elemento, igual que con el mouse. */
export function hacerClick(elemento) {
  act(() => { elemento.click(); });                    // el clic y la actualización de React ocurren dentro de act
}

/* Escribe un texto en un input o textarea.
   React controla el valor de los campos, por eso usamos el "setter" nativo
   del navegador y luego avisamos con el evento "input", como al teclear. */
export function escribir(campo, texto) {
  const prototipo = campo.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; // tipo de campo
  const setter = Object.getOwnPropertyDescriptor(prototipo, "value").set; // función nativa que cambia el valor
  act(() => {
    setter.call(campo, texto);                                          // ponemos el nuevo texto
    campo.dispatchEvent(new Event("input", { bubbles: true }));         // avisamos que el usuario escribió
  });
}

/* Elige una opción de un <select> por su valor. */
export function seleccionar(select, valor) {
  const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set; // setter nativo del select
  act(() => {
    setter.call(select, valor);                                         // elegimos la opción
    select.dispatchEvent(new Event("change", { bubbles: true }));       // avisamos el cambio
  });
}

/* Envía un formulario (como presionar el botón de enviar). */
export function enviarFormulario(formulario) {
  act(() => {
    formulario.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); // dispara el evento submit
  });
}

/* Simula presionar una tecla (por ejemplo "Escape"). */
export function presionarTecla(tecla) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: tecla, bubbles: true })); // evento de teclado
  });
}
