/* Solo se permite volver a rutas internas del sitio (evita redirecciones a
   otros dominios, ej: ?next=//sitio-malicioso.com). */
export default function safeNext(searchParams, fallback = "/") {
  const next = searchParams.get("next") || "";
  return /^\/(?![/\\])[\w\-/.%?=&]*$/.test(next) ? next : fallback;
}
