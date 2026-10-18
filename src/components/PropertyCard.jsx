import { Link } from "react-router-dom";
import { enOferta, formatPrice, getMainImage, porcentajeDescuento, precioFinal, regionCorta } from "../utils/format";

/* Tarjeta de una propiedad (Card de Bootstrap).
   Es un componente "de presentación": todo lo recibe por props.
   - propiedad: objeto con nombre, comuna, precio, imágenes, etc.
   - guardada: true si ya está en "Mis solicitudes" (muestra ♥ en vez de ♡).
   - onToggleGuardar(id): función que se llama al tocar el corazón. */
export default function PropertyCard({ propiedad: p, guardada = false, onToggleGuardar }) {
  const href = "/propiedades/" + encodeURIComponent(p.id);
  const oferta = enOferta(p);

  return (
    <article className="card property-card h-100">
      <div className="position-relative">
        <Link to={href} className="property-media">
          <img src={getMainImage(p)} alt={p.nombre} loading="lazy" decoding="async" />
          <span className="badge rounded-pill text-bg-dark">{p.categoria}</span>
          {oferta && <span className="badge rounded-pill badge-oferta">Oferta -{porcentajeDescuento(p)}%</span>}
        </Link>
        <button
          type="button"
          className={"property-fav" + (guardada ? " is-active" : "")}
          onClick={() => onToggleGuardar && onToggleGuardar(p.id)}
          aria-label={guardada ? "Quitar de mis solicitudes" : "Guardar en mis solicitudes"}
          aria-pressed={guardada}
          title="Guardar en mis solicitudes"
        >
          {guardada ? "♥" : "♡"}
        </button>
      </div>
      <div className="card-body d-flex flex-column gap-2">
        <Link to={href}>
          <p className="property-loc mb-1">📍 {p.comuna}, {regionCorta(p.region)}</p>
          <h3 className="property-title mb-0">{p.nombre}</h3>
        </Link>
        <div className="property-specs">
          {p.dormitorios > 0 && <span>🛏 {p.dormitorios}</span>}
          {p.banos > 0 && <span>🛁 {p.banos}</span>}
          <span>📐 {p.m2} m²</span>
          {p.estacionamiento && <span>🚗 Sí</span>}
        </div>
        <div className="property-price mt-auto">
          <div>
            {oferta && <span className="precio-anterior" data-testid="precio-anterior">{formatPrice(p.precio)}</span>}
            <strong>{formatPrice(precioFinal(p))}</strong>
          </div>
          <small className="text-mute">/ mes</small>
        </div>
      </div>
    </article>
  );
}
