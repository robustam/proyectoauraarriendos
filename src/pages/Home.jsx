import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Reveal from "../components/Reveal";
import PropertyCard from "../components/PropertyCard";
import BlogCard from "../components/BlogCard";
import { EmptyState } from "../components/ui";
import { REGIONES, TESTIMONIOS } from "../services/manifest";
import * as store from "../services/store";
import { useStoreVersion } from "../hooks/useStore";
import useSolicitudToggle from "../hooks/useSolicitudToggle";
import useTitle from "../hooks/useTitle";
import { comunasDe, enOferta, publicadas } from "../services/format";
import heroHome from "../assets/hero-home.jpg";

const reducedMotion =
  typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Buscador del inicio: arma la URL de /propiedades con los filtros elegidos. */
function HomeFilter({ categorias }) {
  const navigate = useNavigate();
  const [f, setF] = useState({ region: "", comuna: "", categoria: "", precioMax: "" });
  const comunas = comunasDe(f.region);

  function onSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => { if (v) params.set(k, v); });
    navigate("/propiedades?" + params.toString());
  }

  return (
    <Reveal as="section" className="container search-panel">
      <form className="card p-3 p-md-4" onSubmit={onSubmit}>
        <div className="row g-3 align-items-end">
          <div className="col-12 col-sm-6 col-lg">
            <label className="filter-label" htmlFor="f-region">Región</label>
            <select id="f-region" className="form-select" value={f.region} onChange={(e) => setF({ ...f, region: e.target.value, comuna: "" })}>
              <option value="">Todas las regiones</option>
              {REGIONES.map((r) => <option key={r.region} value={r.region}>{r.region}</option>)}
            </select>
          </div>
          <div className="col-12 col-sm-6 col-lg">
            <label className="filter-label" htmlFor="f-comuna">Comuna</label>
            <select id="f-comuna" className="form-select" value={f.comuna} onChange={(e) => setF({ ...f, comuna: e.target.value })}>
              <option value="">Todas las comunas</option>
              {comunas.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-12 col-sm-6 col-lg">
            <label className="filter-label" htmlFor="f-tipo">Tipo de inmueble</label>
            <select id="f-tipo" className="form-select" value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })}>
              <option value="">Todos los tipos</option>
              {categorias.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="col-12 col-sm-6 col-lg">
            <label className="filter-label" htmlFor="f-precio">Precio máximo (CLP)</label>
            <input
              type="number" id="f-precio" className="form-control" min="0" step="10000" placeholder="Ej: 800000" inputMode="numeric"
              value={f.precioMax} onChange={(e) => setF({ ...f, precioMax: e.target.value })}
            />
          </div>
          <div className="col-12 col-lg-auto d-grid">
            <button type="submit" className="btn btn-accent">Buscar</button>
          </div>
        </div>
      </form>
    </Reveal>
  );
}

function FeaturedCarousel({ destacadas }) {
  const trackRef = useRef(null);
  const { toggle, isSaved } = useSolicitudToggle();

  function scrollByCard(dir) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild;
    const amount = card ? card.getBoundingClientRect().width + 24 : 300;
    track.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <section className="section container">
      <Reveal className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
        <div>
          <p className="eyebrow">Selección de la semana</p>
          <h2 className="mb-0">Propiedades destacadas</h2>
        </div>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary round-btn" onClick={() => scrollByCard(-1)} aria-label="Anterior">←</button>
          <button type="button" className="btn btn-outline-secondary round-btn" onClick={() => scrollByCard(1)} aria-label="Siguiente">→</button>
        </div>
      </Reveal>
      <Reveal>
        <div className="carousel-strip" ref={trackRef}>
          {destacadas.map((p) => (
            <div key={p.id}><PropertyCard propiedad={p} guardada={isSaved(p.id)} onToggleGuardar={toggle} /></div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const id = window.setInterval(() => setCurrent((c) => (c + 1) % TESTIMONIOS.length), 6000);
    return () => window.clearInterval(id);
  }, []);

  const t = TESTIMONIOS[current];
  return (
    <section className="testimonial-section section">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">Historias reales</p>
          <h2>Lo que dicen quienes ya encontraron su arriendo</h2>
        </Reveal>
        <div key={current} className="reveal is-visible" aria-live="polite">
          <p className="testimonial-stars mb-2">{"★".repeat(t.rating) + "☆".repeat(5 - t.rating)}</p>
          <p className="testimonial-quote mb-3">“{t.texto}”</p>
          <div className="d-flex align-items-center gap-3">
            <div className="testimonial-avatar">{t.nombre.charAt(0)}</div>
            <div><strong className="d-block">{t.nombre}</strong><span className="small opacity-75">{t.comuna}</span></div>
          </div>
        </div>
        <div className="testimonial-dots d-flex gap-2 mt-4">
          {TESTIMONIOS.map((x, i) => (
            <button key={x.nombre} type="button" aria-label={"Testimonio " + (i + 1)} className={i === current ? "active" : ""} onClick={() => setCurrent(i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useTitle("AuraArriendos — Arriendos de casas y departamentos con confianza");
  useStoreVersion();
  const categorias = store.getCategorias();
  const disponibles = publicadas(store.getPropiedades());
  const destacadas = disponibles.filter((p) => p.destacada);
  const ofertas = disponibles.filter(enOferta).length;
  const posts = store.getBlog().slice(0, 2);

  return (
    <>
      <section className="hero">
        <div className="hero-mesh" aria-hidden="true"></div>
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6 hero-animate">
              <p className="eyebrow">Arriendos verificados en todo Chile</p>
              <h1 className="hero-title mb-3">Encuentra un hogar que <em>calce</em> con tu vida.</h1>
              <p className="lede mb-4">Casas y departamentos revisados por nuestro equipo antes de publicarse. Busca por comuna, tipo de inmueble y presupuesto, sin letra chica.</p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/propiedades" className="btn btn-primary btn-lg">Ver propiedades</Link>
                <Link to="/ofertas" className="btn btn-outline-secondary btn-lg">Ver ofertas ({ofertas})</Link>
              </div>
              <div className="d-flex flex-wrap gap-4 mt-4 pt-2">
                <div className="hero-stat"><strong>+180</strong><span>Propiedades activas</span></div>
                <div className="hero-stat"><strong>32</strong><span>Comunas disponibles</span></div>
                <div className="hero-stat"><strong>4,8★</strong><span>Satisfacción de arrendatarios</span></div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-media mx-auto" style={{ maxWidth: 520 }}>
                <div className="hero-media-frame">
                  <img src={heroHome} alt="Casa moderna con jardín al atardecer" loading="eager" />
                </div>
                <div className="card hero-badge p-3 d-flex flex-row align-items-center gap-3">
                  <div className="dot">✓</div>
                  <div className="lh-sm"><strong className="d-block display-font">Publicación verificada</strong><small className="text-mute">Revisión manual antes de publicar</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeFilter categorias={categorias} />

      <section className="section container">
        <Reveal className="section-head">
          <p className="eyebrow">Explora por categoría</p>
          <h2>Cada espacio, un propósito distinto.</h2>
        </Reveal>
        {/* Con pocas categorías las tarjetas son anchas; con más, una grilla de 4. */}
        <Reveal className={"row g-3 " + (categorias.length <= 2 ? "row-cols-1 row-cols-sm-2" : "row-cols-2 row-cols-md-4")}>
          {categorias.map((c) => (
            <div className="col" key={c.id}>
              <Link to={"/categorias/" + c.id} className={"category-card" + (categorias.length <= 2 ? " wide" : "")}>
                <img src={c.imagen} alt={c.nombre} loading="lazy" />
                <span className="category-label">{c.nombre}<small>Ver disponibles</small></span>
              </Link>
            </div>
          ))}
        </Reveal>
      </section>

      <FeaturedCarousel destacadas={destacadas} />

      <Testimonials />

      <section className="section container">
        <Reveal className="section-head">
          <p className="eyebrow">Del blog</p>
          <h2>Guías para arrendar mejor</h2>
        </Reveal>
        {posts.length ? (
          <Reveal className="row g-4 row-cols-1 row-cols-md-2">
            {posts.map((b) => <div className="col" key={b.id}><BlogCard post={b} /></div>)}
          </Reveal>
        ) : (
          <EmptyState glyph="📝" title="Aún no hay publicaciones"><p>Vuelve pronto para leer nuestras guías.</p></EmptyState>
        )}
      </section>

      <section className="section container pt-0">
        <Reveal className="cta-band">
          <p className="eyebrow">¿Tienes una propiedad?</p>
          <h2>Publica tu arriendo y nuestro equipo lo revisa en menos de 48 horas.</h2>
          <p className="my-3">Sin comisiones ocultas. Tú fijas el precio, nosotros verificamos la publicación para dar confianza a quienes la vean.</p>
          <Link to="/publicar" className="btn btn-accent">Publicar mi propiedad</Link>
        </Reveal>
      </section>
    </>
  );
}
