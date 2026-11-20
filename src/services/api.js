/* AuraArriendos — cliente de la API REST del backend (Spring Boot).

   - Todas las llamadas pasan por solicitud(), que agrega el token JWT
     en el header "Authorization: Bearer ...".
   - Si el backend responde 401 (token de acceso vencido), se pide un token
     nuevo con el refresh token (/auth/refresh) y se repite la llamada UNA vez.
     Si la renovación falla, se borra la sesión (hay que iniciar sesión otra vez).
   - Los errores llegan como ApiError con el mensaje que envía el backend,
     listo para mostrarlo en pantalla.

   La URL base se configura con la variable VITE_API_URL (archivo .env de Vite
   o argumento de Docker). Por defecto: http://localhost:8080/api/v1.

   Se exporta como OBJETO (api) para que las pruebas puedan reemplazar sus
   métodos con espías: spyOn(api, "post").and.returnValue(Promise.resolve(...)). */

const BASE_URL = (import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:8080/api/v1";

const CLAVE_TOKENS = "aura_tokens";

/* Error con el código HTTP y el mensaje del backend ({ estado, mensaje, errores }). */
export class ApiError extends Error {
  constructor(mensaje, estado, errores) {
    super(mensaje);
    this.name = "ApiError";
    this.estado = estado;
    this.errores = errores || {};
  }
}

/* ---------- Tokens (persisten en localStorage para sobrevivir a una recarga) ---------- */

export const tokens = {
  leer() {
    try {
      return JSON.parse(window.localStorage.getItem(CLAVE_TOKENS)) || null;
    } catch (e) {
      return null;
    }
  },
  guardar(accessToken, refreshToken) {
    window.localStorage.setItem(CLAVE_TOKENS, JSON.stringify({ accessToken, refreshToken }));
  },
  borrar() {
    window.localStorage.removeItem(CLAVE_TOKENS);
  }
};

/* Se avisa al store cuando la sesión expira, para que limpie los datos y re-renderice. */
let alExpirarSesion = () => {};
export function onSesionExpirada(fn) {
  alExpirarSesion = fn;
}

/* En estas rutas un 401 significa "datos incorrectos", no "token vencido": no se renueva. */
const SIN_RENOVACION = ["/auth/login", "/auth/registro", "/auth/refresh", "/auth/logout"];

/* Si varias llamadas reciben 401 al mismo tiempo, se hace UNA sola renovación. */
let renovacionEnCurso = null;

async function renovarTokens() {
  const actuales = tokens.leer();
  if (!actuales || !actuales.refreshToken) throw new ApiError("La sesión expiró, inicia sesión nuevamente", 401);
  if (!renovacionEnCurso) {
    renovacionEnCurso = fetch(BASE_URL + "/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: actuales.refreshToken })
    })
      .then(async (res) => {
        if (!res.ok) throw new ApiError("La sesión expiró, inicia sesión nuevamente", 401);
        const datos = await res.json();
        tokens.guardar(datos.accessToken, datos.refreshToken); // rotación: el refresh viejo ya no sirve
        return datos;
      })
      .finally(() => { renovacionEnCurso = null; });
  }
  return renovacionEnCurso;
}

async function leerError(res) {
  let cuerpo = null;
  try { cuerpo = await res.json(); } catch (e) { /* respuesta sin JSON */ }
  const mensaje = (cuerpo && cuerpo.mensaje) || "Error " + res.status + " al comunicarse con el servidor";
  return new ApiError(mensaje, res.status, cuerpo && cuerpo.errores);
}

async function solicitud(metodo, ruta, cuerpo, { reintentar = true } = {}) {
  const headers = { Accept: "application/json" };
  if (cuerpo !== undefined) headers["Content-Type"] = "application/json";
  const actuales = tokens.leer();
  if (actuales && actuales.accessToken) headers.Authorization = "Bearer " + actuales.accessToken;

  let res;
  try {
    res = await fetch(BASE_URL + ruta, {
      method: metodo,
      headers,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined
    });
  } catch (e) {
    throw new ApiError("No se pudo conectar con el servidor. Revisa que el backend esté encendido.", 0);
  }

  /* Token de acceso vencido: se renueva y se repite la petición una sola vez. */
  if (res.status === 401 && reintentar && actuales && actuales.refreshToken && !SIN_RENOVACION.includes(ruta)) {
    try {
      await renovarTokens();
    } catch (e) {
      tokens.borrar();
      alExpirarSesion();
      throw e;
    }
    return solicitud(metodo, ruta, cuerpo, { reintentar: false });
  }

  if (!res.ok) throw await leerError(res);
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (ruta) => solicitud("GET", ruta),
  post: (ruta, cuerpo) => solicitud("POST", ruta, cuerpo ?? {}),
  put: (ruta, cuerpo) => solicitud("PUT", ruta, cuerpo ?? {}),
  patch: (ruta, cuerpo) => solicitud("PATCH", ruta, cuerpo ?? {}),
  del: (ruta) => solicitud("DELETE", ruta)
};

export default api;
