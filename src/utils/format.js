/* AuraArriendos — helpers de formato compartidos. */

import { REGIONES } from "../data/manifest";

export function formatPrice(n) {
  return "$" + Number(n || 0).toLocaleString("es-CL");
}

/* "2026-03-04" -> "4 de marzo de 2026" */
export function formatFechaLarga(fechaISO) {
  if (!fechaISO) return "";
  return new Date(fechaISO + "T12:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
}

export function formatFechaHora(iso) {
  return new Date(iso).toLocaleString("es-CL", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function hoyISO() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

/* Primera foto de la propiedad (las semillas usan `imagenes`, las antiguas `imagen`). */
export function getMainImage(p) {
  if (p && Array.isArray(p.imagenes) && p.imagenes.length > 0) return p.imagenes[0];
  return (p && p.imagen) || "/img/prop-1.jpg";
}

export function getImagenes(p) {
  if (p && Array.isArray(p.imagenes) && p.imagenes.length > 0) return p.imagenes;
  return [getMainImage(p)];
}

/* Solo propiedades aprobadas y no arrendadas se muestran en el sitio público. */
export function publicadas(lista) {
  return lista.filter((p) => p.estado === "publicada" && !p.arrendada);
}

export function regionCorta(region) {
  return String(region || "").replace("Región Metropolitana de Santiago", "RM");
}

export function comunasDe(nombreRegion) {
  const r = REGIONES.find((x) => x.region === nombreRegion);
  return r ? r.comunas : [];
}

export function recortar(texto, max) {
  const t = String(texto || "");
  return t.length > max ? t.slice(0, max) + "…" : t;
}

/* Reduce la imagen a máx. 1200 px de ancho (JPEG) para no llenar el localStorage. */
export function comprimirImagen(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const original = e.target.result;
      const img = new Image();
      img.onload = () => {
        const max = 1200;
        const escala = img.width > max ? max / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => resolve(original);
      img.src = original;
    };
    reader.readAsDataURL(file);
  });
}

/* ---------- Ofertas ---------- */

/* Una propiedad está en oferta si tiene un precio rebajado menor al normal. */
export function enOferta(p) {
  return !!p && p.precioOferta != null && p.precioOferta !== "" && Number(p.precioOferta) < Number(p.precio);
}

/* Precio que realmente se cobra: el de oferta si existe, si no el normal. */
export function precioFinal(p) {
  return enOferta(p) ? Number(p.precioOferta) : Number(p.precio || 0);
}

export function porcentajeDescuento(p) {
  if (!enOferta(p)) return 0;
  return Math.round((1 - Number(p.precioOferta) / Number(p.precio)) * 100);
}

/* ---------- Filtros del catálogo (función pura, fácil de probar) ----------
   filtros: { q, region, comuna, categoria, precioMax, orden } */
export function filtrarPropiedades(lista, filtros = {}) {
  const q = String(filtros.q || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const precioMax = filtros.precioMax ? Number(filtros.precioMax) : null;
  const resultado = lista.filter((p) => {
    if (filtros.region && p.region !== filtros.region) return false;
    if (filtros.comuna && p.comuna !== filtros.comuna) return false;
    if (filtros.categoria && p.categoria !== filtros.categoria) return false;
    if (precioMax && precioFinal(p) > precioMax) return false;
    if (q) {
      const texto = [p.nombre, p.comuna, p.region, p.categoria, p.descripcion]
        .join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (texto.indexOf(q) === -1) return false;
    }
    return true;
  });
  if (filtros.orden === "precio-asc") resultado.sort((a, b) => precioFinal(a) - precioFinal(b));
  if (filtros.orden === "precio-desc") resultado.sort((a, b) => precioFinal(b) - precioFinal(a));
  return resultado;
}

/* Se puede reservar (pagar) si está publicada, no arrendada y le queda stock. */
export function disponibleParaReservar(p) {
  return !!p && p.estado === "publicada" && !p.arrendada && Number(p.unidadesDisponibles || 0) > 0;
}
