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
import CategoriasAdmin from "../src/pages/admin/CategoriasAdmin";               // listado
import CategoriaForm from "../src/pages/admin/CategoriaForm";                   // formulario nueva/editar
import * as store from "../src/services/store";                                 // datos
import { api, ApiError } from "../src/services/api";                          // API (reemplazada por espías)
import {
  buscarBoton, buscarCampo, datosDeEjemplo, escribir, esperar, hacerClick, hayTexto, limpiarPantalla, renderizar
} from "./utils/pantalla";                                                  // ayudantes

/* Agrega una categoría a la caché, como si hubiera llegado del backend. */
function categoriaEnCache(categoria) {
  localStorage.setItem("aura_categorias", JSON.stringify(store.getCategorias().concat(categoria)));
}

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

  it("elimina una categoría vacía solo después de confirmar (DELETE al backend)", async () => {
    categoriaEnCache({ id: "bodega", nombre: "Bodega", descripcion: "", imagen: "/img/prop-1.jpg" }); // categoría sin propiedades
    api.del.and.returnValue(Promise.resolve(null));                         // el backend responde 204
    renderizar(<CategoriasAdmin />);

    hacerClick(ultimoBoton("Eliminar"));                                    // abre el modal de confirmación
    expect(hayTexto("¿Confirmas que deseas eliminar esta categoría?")).toBe(true);
    expect(api.del).not.toHaveBeenCalled();                                 // todavía no se elimina

    hacerClick(ultimoBoton("Eliminar"));                                    // confirma en el modal
    await esperar();
    expect(api.del).toHaveBeenCalledWith("/categorias/bodega");             // se pidió al backend
    expect(store.getCategoriaPorId("bodega")).toBeNull();                   // y se quitó de la caché
    expect(hayTexto("Categoría eliminada")).toBe(true);                     // aviso de éxito
  });

  it("si el backend no permite eliminar (409) muestra su mensaje y la categoría sigue", async () => {
    categoriaEnCache({ id: "bodega", nombre: "Bodega", descripcion: "", imagen: "/img/prop-1.jpg" });
    api.del.and.returnValue(Promise.reject(new ApiError("No se puede eliminar la categoría Bodega porque tiene propiedades asociadas", 409)));
    renderizar(<CategoriasAdmin />);
    hacerClick(ultimoBoton("Eliminar"));
    hacerClick(ultimoBoton("Eliminar"));
    await esperar();
    expect(hayTexto("porque tiene propiedades asociadas")).toBe(true);
    expect(store.getCategoriaPorId("bodega")).toBeTruthy();
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

  it("crea una categoría nueva en el backend y vuelve al listado", async () => {
    /* El backend (simulado) genera el id desde el nombre. */
    api.post.and.callFake((ruta, datos) => Promise.resolve({ ...datos, id: "bodega", cantidadProductos: 0 }));
    dibujarFormulario("/admin/categorias/nueva");
    escribir(buscarCampo("Nombre"), "Bodega");
    escribir(buscarCampo("Descripción (opcional)"), "Espacios para guardar");
    hacerClick(buscarBoton("Guardar categoría"));
    await esperar();

    expect(api.post).toHaveBeenCalledWith("/categorias", jasmine.objectContaining({ nombre: "Bodega" })); // POST correcto
    expect(store.getCategoriaPorId("bodega").descripcion).toBe("Espacios para guardar"); // quedó en la caché
    expect(hayTexto("LISTADO DE CATEGORÍAS")).toBe(true);                   // navegó al listado
  });

  it("al editar envía un PUT con el id de la categoría", async () => {
    api.put.and.callFake((ruta, datos) => Promise.resolve({ ...datos, id: "casa", cantidadProductos: 4 }));
    dibujarFormulario("/admin/categorias/casa/editar");
    expect(buscarCampo("Nombre").value).toBe("Casa");                       // el formulario viene precargado
    escribir(buscarCampo("Nombre"), "Casa familiar");
    hacerClick(buscarBoton("Guardar categoría"));
    await esperar();

    expect(api.put).toHaveBeenCalledWith("/categorias/casa", jasmine.objectContaining({ nombre: "Casa familiar" }));
    expect(store.getCategoriaPorId("casa").nombre).toBe("Casa familiar");  // la caché se actualizó
    expect(hayTexto("LISTADO DE CATEGORÍAS")).toBe(true);
  });

  it("si la categoría a editar no existe vuelve al listado", () => {
    dibujarFormulario("/admin/categorias/inexistente/editar");
    expect(hayTexto("LISTADO DE CATEGORÍAS")).toBe(true);
  });
});
