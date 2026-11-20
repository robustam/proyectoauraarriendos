/* =====================================================================
   PRUEBA — Cliente de la API (services/api.js)
   Tipo: pruebas de LÓGICA + MOCK de fetch.

   Reemplazamos window.fetch con un espía para simular las respuestas
   del backend y comprobar que:
   - Se envía el token JWT en el header Authorization.
   - Un error del backend llega como ApiError con su mensaje.
   - Si el token de acceso venció (401), se renueva con el refresh token
     y la petición se repite automáticamente (rotación de tokens).
   - Si la renovación falla, se borran los tokens (hay que volver a entrar).
   - Si el servidor no responde, el mensaje lo explica.
   ===================================================================== */

import { api, ApiError, tokens } from "../src/services/api";

/* Crea una respuesta falsa de fetch. */
function respuesta(status, cuerpo) {
  return Promise.resolve(new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json" }
  }));
}

describe("Cliente de la API (api.js)", () => {

  beforeEach(() => tokens.borrar());
  afterEach(() => tokens.borrar());

  it("envía el token JWT en el header Authorization", async () => {
    tokens.guardar("acceso-1", "refresh-1");
    const espia = spyOn(window, "fetch").and.returnValue(respuesta(200, [{ id: "PR-1001" }]));
    const datos = await api.get("/productos");
    const [url, opciones] = espia.calls.mostRecent().args;
    expect(url).toMatch(/\/api\/v1\/productos$/);
    expect(opciones.headers.Authorization).toBe("Bearer acceso-1");
    expect(datos[0].id).toBe("PR-1001");
  });

  it("sin sesión no envía Authorization", async () => {
    const espia = spyOn(window, "fetch").and.returnValue(respuesta(200, []));
    await api.get("/categorias");
    expect(espia.calls.mostRecent().args[1].headers.Authorization).toBeUndefined();
  });

  it("convierte un error del backend en ApiError con su mensaje", async () => {
    spyOn(window, "fetch").and.returnValue(respuesta(409, { estado: 409, mensaje: "Ya existe una categoría llamada Casa" }));
    let error = null;
    try { await api.post("/categorias", { nombre: "Casa" }); } catch (e) { error = e; }
    expect(error instanceof ApiError).toBe(true);
    expect(error.estado).toBe(409);
    expect(error.message).toBe("Ya existe una categoría llamada Casa");
  });

  it("con 401 renueva el token y repite la petición una vez", async () => {
    tokens.guardar("acceso-vencido", "refresh-1");
    const espia = spyOn(window, "fetch").and.callFake((url, opciones) => {
      if (url.endsWith("/auth/refresh")) return respuesta(200, { accessToken: "acceso-nuevo", refreshToken: "refresh-2" });
      return opciones.headers.Authorization === "Bearer acceso-nuevo"
        ? respuesta(200, { correo: "cliente@gmail.com" })
        : respuesta(401, { mensaje: "Debes iniciar sesión" });
    });
    const usuario = await api.get("/auth/me");
    expect(usuario.correo).toBe("cliente@gmail.com");                 // la segunda vez funcionó
    expect(espia.calls.count()).toBe(3);                              // me (401) → refresh → me (200)
    expect(tokens.leer()).toEqual({ accessToken: "acceso-nuevo", refreshToken: "refresh-2" }); // tokens rotados
  });

  it("si la renovación falla borra los tokens", async () => {
    tokens.guardar("acceso-vencido", "refresh-revocado");
    spyOn(window, "fetch").and.returnValue(respuesta(401, { mensaje: "La sesión expiró" }));
    let error = null;
    try { await api.get("/auth/me"); } catch (e) { error = e; }
    expect(error.estado).toBe(401);
    expect(tokens.leer()).toBeNull();
  });

  it("un 401 en el login NO intenta renovar (son credenciales incorrectas)", async () => {
    tokens.guardar("viejo", "refresh-viejo");
    const espia = spyOn(window, "fetch").and.returnValue(respuesta(401, { mensaje: "Correo o contraseña incorrectos" }));
    let error = null;
    try { await api.post("/auth/login", { correo: "a@gmail.com", clave: "x" }); } catch (e) { error = e; }
    expect(error.message).toBe("Correo o contraseña incorrectos");
    expect(espia.calls.count()).toBe(1);
  });

  it("si el servidor no responde explica el problema", async () => {
    spyOn(window, "fetch").and.returnValue(Promise.reject(new TypeError("Failed to fetch")));
    let error = null;
    try { await api.get("/productos"); } catch (e) { error = e; }
    expect(error.estado).toBe(0);
    expect(error.message).toContain("No se pudo conectar con el servidor");
  });

  it("una respuesta 204 devuelve null", async () => {
    spyOn(window, "fetch").and.returnValue(Promise.resolve(new Response(null, { status: 204 })));
    expect(await api.del("/categorias/bodega")).toBeNull();
  });
});
