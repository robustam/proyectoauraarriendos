/* =====================================================================
   PRUEBA — Moderación de propiedades (pages/admin/AdminPropiedades.jsx)
   Tipo: RENDERIZADO según el ROL + llamadas a la API con MOCKS.

   ¿Qué se prueba?
   - El Administrador aprueba una publicación pendiente: se llama a
     PATCH /productos/{id}/estado y la tabla se actualiza.
   - Si el backend rechaza la acción, se muestra su mensaje.
   - El Vendedor ve el listado, pero SIN botones para aprobar, editar ni eliminar.
   ===================================================================== */

import { Route } from "react-router-dom";
import AdminLayout from "../src/components/AdminLayout";
import AdminPropiedades from "../src/pages/admin/AdminPropiedades";
import * as store from "../src/services/store";
import { api, ApiError } from "../src/services/api";
import { datosDeEjemplo, esperar, hacerClick, hayTexto, iniciarSesionComo, limpiarPantalla, renderizar } from "./utils/pantalla";

function dibujar() {
  renderizar(null, {
    ruta: "/admin/propiedades?estado=pendiente",
    rutas: [
      <Route key="a" path="/admin" element={<AdminLayout />}>
        <Route path="propiedades" element={<AdminPropiedades />} />
      </Route>
    ]
  });
}

const botones = (texto) => Array.from(document.querySelectorAll("button, a")).filter((b) => b.textContent.trim() === texto);

describe("Panel — moderación de propiedades", () => {

  beforeEach(() => datosDeEjemplo());
  afterEach(() => limpiarPantalla());

  it("el Administrador aprueba una publicación pendiente (PATCH al backend)", async () => {
    iniciarSesionComo("admin@duoc.cl");
    api.patch.mockImplementation((ruta, cuerpo) => Promise.resolve({ ...store.getPropiedadPorId("PR-2001"), estado: cuerpo.estado }));
    dibujar();
    hacerClick(botones("Aprobar")[0]);                                      // aprueba PR-2001
    await esperar();
    expect(api.patch).toHaveBeenCalledWith("/productos/PR-2001/estado", { estado: "publicada", motivo: undefined });
    expect(store.getPropiedadPorId("PR-2001").estado).toBe("publicada");   // la caché se actualizó
    expect(hayTexto("Publicación aprobada")).toBe(true);                    // aviso de éxito
  });

  it("si el backend rechaza la acción muestra su mensaje", async () => {
    iniciarSesionComo("admin@duoc.cl");
    api.patch.mockReturnValue(Promise.reject(new ApiError("Tu rol no tiene permiso para esta acción", 403)));
    dibujar();
    hacerClick(botones("Aprobar")[0]);
    await esperar();
    expect(hayTexto("Tu rol no tiene permiso para esta acción")).toBe(true);
    expect(store.getPropiedadPorId("PR-2001").estado).toBe("pendiente");   // no cambió
  });

  it("el Vendedor ve el listado pero sin acciones de modificación", () => {
    iniciarSesionComo("vendedor@gmail.com");
    dibujar();
    expect(hayTexto("Departamento cerca del metro (en revisión)")).toBe(true); // ve la propiedad
    expect(botones("Ver").length).toBeGreaterThan(0);                       // puede ver el detalle
    expect(botones("Aprobar").length).toBe(0);                              // pero no aprobar
    expect(botones("Rechazar").length).toBe(0);
    expect(botones("Editar").length).toBe(0);
    expect(botones("Eliminar").length).toBe(0);
    expect(botones("+ Nueva propiedad").length).toBe(0);
  });
});
