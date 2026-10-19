/* =====================================================================
   PRUEBA 18 — Categorías del panel (CategoriasAdmin.jsx y CategoriaForm.jsx)
   Tipo: CRUD completo, RENDERIZADO CONDICIONAL, EVENTOS y MODAL.

   ¿Qué se prueba?
   - El listado cuenta las propiedades de cada categoría.
   - Una categoría con propiedades NO se puede eliminar (botón deshabilitado).
   - Una categoría vacía se elimina después de confirmar en el modal.
   - El formulario valida nombre obligatorio y único.
   - Crear una categoría la guarda y vuelve al listado.
   - Editar el nombre actualiza también las propiedades que la usaban.
   ===================================================================== */

import { Route } from "react-router-dom";                                   // para declarar rutas de prueba
import CategoriasAdmin from "../pages/admin/CategoriasAdmin";               // listado
import CategoriaForm from "../pages/admin/CategoriaForm";                   // formulario nueva/editar
import * as store from "../services/store";                                 // datos
import {
  buscarBoton, buscarCampo, datosDeEjemplo, ejecutar, escribir, hacerClick, hayTexto, limpiarPantalla, renderizar
} from "./utils/pantalla";                                                  // ayudantes

/* Último botón con ese texto (el del modal queda después de los de la tabla). */
function ultimoBoton(texto) {
  const botones = Array.from(document.querySelectorAll("button")).filter((b) => b.textContent.trim() === texto);
  return botones[botones.length - 1];
}

/* Dibuja el formulario con un listado falso para comprobar la navegación. */
function dibujarFormulario(ruta) {
  renderizar(null, {
    ruta,
    rutas: [
      <Route key="n" path="/admin/categorias/nueva" element={<CategoriaForm />} />,
      <Route key="e" path="/admin/categorias/:id/editar" element={<CategoriaForm />} />,
      <Route key="l" path="/admin/categorias" element={<p>LISTADO DE CATEGORÍAS</p>} />
    ]
  });
}

describe("Categorías del panel — listado", () => {

  beforeEach(() => datosDeEjemplo());
  afterEach(() => limpiarPantalla());

  it("muestra cada categoría con su cantidad de propiedades", () => {
    renderizar(<CategoriasAdmin />);
    const casas = store.getPropiedades().filter((p) => p.categoria === "Casa").length;
    expect(hayTexto("Categorías (2)")).toBe(true);                          // título con el total
    expect(hayTexto(casas + " propiedades")).toBe(true);                    // contador de la categoría Casa
  });

  it("deshabilita Eliminar si la categoría tiene propiedades", () => {
    renderizar(<CategoriasAdmin />);
    const botones = Array.from(document.querySelectorAll("button")).filter((b) => b.textContent.trim() === "Eliminar");
    expect(botones.length).toBe(2);                                         // una por categoría
    expect(botones.every((b) => b.disabled)).toBe(true);                    // ambas están en uso
  });

  it("elimina una categoría vacía solo después de confirmar", () => {
    ejecutar(() => store.guardarCategoria({ id: "bodega", nombre: "Bodega", descripcion: "", imagen: "/img/prop-1.jpg" })); // categoría sin propiedades
    renderizar(<CategoriasAdmin />);

    hacerClick(ultimoBoton("Eliminar"));                                    // abre el modal de confirmación
    expect(hayTexto("¿Confirmas que deseas eliminar esta categoría?")).toBe(true);
    expect(store.getCategoriaPorId("bodega")).toBeTruthy();                 // todavía no se elimina

    hacerClick(ultimoBoton("Eliminar"));                                    // confirma en el modal
    expect(store.getCategoriaPorId("bodega")).toBeNull();                   // ahora sí
    expect(hayTexto("Categoría eliminada")).toBe(true);                     // aviso de éxito
  });
});

describe("Categorías del panel — formulario", () => {

  beforeEach(() => datosDeEjemplo());
  afterEach(() => limpiarPantalla());

  it("exige un nombre y no acepta uno repetido", () => {
    dibujarFormulario("/admin/categorias/nueva");
    hacerClick(buscarBoton("Guardar categoría"));                           // enviamos vacío
    expect(hayTexto("Requerido, máximo 40 caracteres.")).toBe(true);

    escribir(buscarCampo("Nombre"), "casa");                                // ya existe "Casa" (sin importar mayúsculas)
    expect(hayTexto("Ya existe una categoría con ese nombre.")).toBe(true);
    expect(store.getCategorias().length).toBe(2);                           // no se guardó nada
  });

  it("crea una categoría nueva y vuelve al listado", () => {
    dibujarFormulario("/admin/categorias/nueva");
    escribir(buscarCampo("Nombre"), "Bodega");
    escribir(buscarCampo("Descripción (opcional)"), "Espacios para guardar");
    hacerClick(buscarBoton("Guardar categoría"));

    expect(store.getCategoriaPorId("bodega").descripcion).toBe("Espacios para guardar"); // el id se genera desde el nombre
    expect(hayTexto("LISTADO DE CATEGORÍAS")).toBe(true);                   // navegó al listado
  });

  it("al renombrar una categoría actualiza las propiedades que la usaban", () => {
    dibujarFormulario("/admin/categorias/casa/editar");
    expect(buscarCampo("Nombre").value).toBe("Casa");                       // el formulario viene precargado
    escribir(buscarCampo("Nombre"), "Casa familiar");
    hacerClick(buscarBoton("Guardar categoría"));

    const props = store.getPropiedades();
    expect(props.some((p) => p.categoria === "Casa")).toBe(false);          // ya nadie usa el nombre antiguo
    expect(props.filter((p) => p.categoria === "Casa familiar").length).toBeGreaterThan(0); // todas pasaron al nuevo
  });

  it("si la categoría a editar no existe vuelve al listado", () => {
    dibujarFormulario("/admin/categorias/inexistente/editar");
    expect(hayTexto("LISTADO DE CATEGORÍAS")).toBe(true);
  });
});
