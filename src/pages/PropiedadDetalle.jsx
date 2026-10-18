import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Reveal from "../components/Reveal";
import PropertyGrid from "../components/PropertyGrid";
import FavoritoButton from "../components/FavoritoButton";
import { EmptyState } from "../components/ui";
import * as store from "../services/store";
import { useSession, useStoreVersion } from "../hooks/useStore";
import useSolicitudToggle from "../hooks/useSolicitudToggle";
import useTitle from "../hooks/useTitle";
import { enOferta, formatPrice, getImagenes, porcentajeDescuento, precioFinal, publicadas } from "../utils/format";

function Migas({ nombre }) {
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
        <li className="breadcrumb-item"><Link to="/propiedades">Propiedades</Link></li>
        <li className="breadcrumb-item active" aria-current="page">{nombre || "Detalle"}</li>
      </ol>
    </nav>
  );
}

export default function PropiedadDetalle() {
  useStoreVersion();
  const { id } = useParams();
  const sesion = useSession();
  const { toggle, isSaved } = useSolicitudToggle();
  const p = store.getPropiedadPorId(id);
  const [fotoActiva, setFotoActiva] = useState(0);

  useTitle(p ? p.nombre + " — AuraArriendos" : "Detalle de propiedad — AuraArriendos");
  useEffect(() => { setFotoActiva(0); }, [id]);

  if (!p) {
    return (
      <section className="container section-tight">
        <Migas />
        <EmptyState glyph="🔍" title="No encontramos esa propiedad">
          <p>Puede que ya no esté disponible.</p>
          <Link to="/propiedades" className="btn btn-primary">Volver al listado</Link>
        </EmptyState>
      </section>
    );
  }

  if (p.arrendada && !store.esStaff(sesion)) {
    return (
      <section className="container section-tight">
        <Migas nombre={p.nombre} />
        <EmptyState glyph="🔑" title="Esta propiedad ya fue arrendada">
          <p>Por ahora no está disponible. Revisa otras opciones similares en nuestro listado.</p>
          <Link to="/propiedades" className="btn btn-primary">Ver propiedades disponibles</Link>
        </EmptyState>
      </section>
    );
  }

  const fotos = getImagenes(p);
  const oferta = enOferta(p);
  const sinStock = Number(p.unidadesDisponibles || 0) <= 0;
  const relacionadas = publicadas(store.getPropiedades())
    .filter((x) => x.id !== p.id && (x.categoria === p.categoria || x.comuna === p.comuna))
    .slice(0, 3);

  return (
    <>
      <section className="container section-tight">
        <Migas nombre={p.nombre} />
        <div className="row g-4 g-lg-5">
          <div className="col-lg-7">
            <div className="detail-main-img"><img src={fotos[fotoActiva] || fotos[0]} alt={p.nombre} /></div>
            {fotos.length > 1 && (
              <div className="d-flex gap-2 mt-2 flex-wrap">
                {fotos.map((url, idx) => (
                  <button
                    key={url + idx} type="button" className={"detail-thumb" + (idx === fotoActiva ? " active" : "")}
                    onClick={() => setFotoActiva(idx)} aria-label={"Ver foto " + (idx + 1)}
                  >
                    <img src={url} alt={"Foto " + (idx + 1)} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="col-lg-5">
            <p className="property-loc mb-2">📍 {p.direccion}, {p.comuna}</p>
            <h1 className="h2">{p.nombre}</h1>
            <div className="d-flex flex-wrap gap-2 my-2">
              <span className="badge rounded-pill text-bg-dark">{p.categoria}</span>
              {oferta && <span className="badge rounded-pill badge-oferta">Oferta -{porcentajeDescuento(p)}%</span>}
              {p.arrendada && <span className="status-pill status-arrendada">Arrendada — oculta del sitio público</span>}
            </div>
            <p className="detail-price my-3">
              {oferta && <span className="precio-anterior fs-6">{formatPrice(p.precio)}</span>}
              {formatPrice(precioFinal(p))} <small className="fs-6 text-mute">/ mes</small>
            </p>
            <div className="row g-2 mb-3">
              <div className="col-6"><div className="spec-box"><strong>{p.dormitorios}</strong><span>Dormitorios</span></div></div>
              <div className="col-6"><div className="spec-box"><strong>{p.banos}</strong><span>Baños</span></div></div>
              <div className="col-6"><div className="spec-box"><strong>{p.m2} m²</strong><span>Superficie</span></div></div>
              <div className="col-6"><div className="spec-box"><strong>{p.estacionamiento ? "Sí" : "No"}</strong><span>Estacionamiento</span></div></div>
            </div>
            <p className={"small mb-3 " + (sinStock ? "text-danger fw-semibold" : "text-mute")}>
              {sinStock ? "Sin unidades disponibles por ahora." : "Unidades disponibles: " + p.unidadesDisponibles}
            </p>
            <div className="d-flex flex-wrap gap-2">
              <FavoritoButton guardada={isSaved(p.id)} onClick={() => toggle(p.id)} disabled={sinStock && !isSaved(p.id)} />
              <Link to="/contacto" className="btn btn-outline-secondary">Contactar al arrendador</Link>
            </div>
            <p className="mt-4 text-body-secondary">{p.descripcion}</p>
          </div>
        </div>
      </section>

      {relacionadas.length > 0 && (
        <section className="container section-tight">
          <Reveal className="section-head">
            <p className="eyebrow">También te puede interesar</p>
            <h2>Propiedades relacionadas</h2>
          </Reveal>
          <PropertyGrid propiedades={relacionadas} />
        </section>
      )}
    </>
  );
}
