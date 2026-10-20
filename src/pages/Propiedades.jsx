import { useSearchParams } from "react-router-dom";
import Reveal from "../components/Reveal";
import PropertyGrid from "../components/PropertyGrid";
import { EmptyState } from "../components/ui";
import { REGIONES } from "../services/manifest";
import * as store from "../services/store";
import { useStoreVersion } from "../hooks/useStore";
import useTitle from "../hooks/useTitle";
import { comunasDe, filtrarPropiedades, formatPrice, publicadas } from "../services/format";

/* Catálogo con filtros. Los filtros viven en la URL (?q=&region=&comuna=&categoria=&precioMax=&orden=),
   así se pueden compartir y el buscador del encabezado llega con ellos aplicados.
   Layout Bootstrap: filtros a la izquierda (col-lg-3) y resultados (col-lg-9). */
export default function Propiedades() {
  useTitle("Propiedades en arriendo — AuraArriendos");
  useStoreVersion();
  const [params, setParams] = useSearchParams();
  const categorias = store.getCategorias();

  const f = {
    q: params.get("q") || "",
    region: params.get("region") || "",
    comuna: params.get("comuna") || "",
    categoria: params.get("categoria") || "",
    precioMax: params.get("precioMax") || "",
    orden: params.get("orden") || ""
  };
  const comunas = comunasDe(f.region);

  function update(patch) {
    const next = { ...f, ...patch };
    const p = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => { if (v) p.set(k, v); });
    setParams(p, { replace: true });
  }

  const lista = filtrarPropiedades(publicadas(store.getPropiedades()), f);

  const chips = [];
  if (f.q) chips.push({ key: "q", label: "Búsqueda: " + f.q, clear: { q: "" } });
  if (f.region) chips.push({ key: "region", label: "Región: " + f.region, clear: { region: "", comuna: "" } });
  if (f.comuna) chips.push({ key: "comuna", label: "Comuna: " + f.comuna, clear: { comuna: "" } });
  if (f.categoria) chips.push({ key: "categoria", label: "Tipo: " + f.categoria, clear: { categoria: "" } });
  if (f.precioMax) chips.push({ key: "precioMax", label: "Máx: " + formatPrice(f.precioMax), clear: { precioMax: "" } });

  return (
    <>
      <Reveal as="section" className="page-hero container">
        <p className="eyebrow">Catálogo completo</p>
        <h1>Encuentra tu próxima dirección</h1>
        <p className="lede">Filtra por región, comuna, tipo de inmueble y presupuesto. Todas las publicaciones fueron revisadas por nuestro equipo.</p>
      </Reveal>

      <section className="container section-tight pt-0">
        <div className="row g-4">
          <aside className="col-lg-3">
            <form className="card p-3 filter-sidebar" onSubmit={(e) => e.preventDefault()} aria-label="Filtros">
              <div className="row g-3">
                <div className="col-12">
                  <label className="filter-label" htmlFor="lf-q">Palabra clave</label>
                  <input id="lf-q" type="search" className="form-control" value={f.q} placeholder="Ej: jardín, metro" onChange={(e) => update({ q: e.target.value })} />
                </div>
                <div className="col-12 col-md-6 col-lg-12">
                  <label className="filter-label" htmlFor="lf-region">Región</label>
                  <select id="lf-region" className="form-select" value={f.region} onChange={(e) => update({ region: e.target.value, comuna: "" })}>
                    <option value="">Todas las regiones</option>
                    {REGIONES.map((r) => <option key={r.region} value={r.region}>{r.region}</option>)}
                  </select>
                </div>
                <div className="col-12 col-md-6 col-lg-12">
                  <label className="filter-label" htmlFor="lf-comuna">Comuna</label>
                  <select id="lf-comuna" className="form-select" value={f.comuna} onChange={(e) => update({ comuna: e.target.value })}>
                    <option value="">Todas las comunas</option>
                    {comunas.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-12 col-md-4 col-lg-12">
                  <label className="filter-label" htmlFor="lf-tipo">Tipo de inmueble</label>
                  <select id="lf-tipo" className="form-select" value={f.categoria} onChange={(e) => update({ categoria: e.target.value })}>
                    <option value="">Todos los tipos</option>
                    {categorias.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                  </select>
                </div>
                <div className="col-6 col-md-4 col-lg-12">
                  <label className="filter-label" htmlFor="lf-precio">Precio máximo</label>
                  <input
                    type="number" id="lf-precio" className="form-control" min="0" step="10000" placeholder="Ej: 900000" inputMode="numeric"
                    value={f.precioMax} onChange={(e) => update({ precioMax: e.target.value })}
                  />
                </div>
                <div className="col-6 col-md-4 col-lg-12">
                  <label className="filter-label" htmlFor="lf-orden">Ordenar por</label>
                  <select id="lf-orden" className="form-select" value={f.orden} onChange={(e) => update({ orden: e.target.value })}>
                    <option value="">Relevancia</option>
                    <option value="precio-asc">Precio: menor a mayor</option>
                    <option value="precio-desc">Precio: mayor a menor</option>
                  </select>
                </div>
                <div className="col-12 d-grid">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setParams({}, { replace: true })}>Limpiar filtros</button>
                </div>
              </div>
            </form>
          </aside>

          <div className="col-lg-9">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <p className="mb-0"><strong data-testid="total-resultados">{lista.length}</strong> propiedades encontradas</p>
              <div className="d-flex flex-wrap gap-2">
                {chips.map((c) => (
                  <span key={c.key} className="chip">
                    {c.label}
                    <button type="button" onClick={() => update(c.clear)} aria-label={"Quitar filtro " + c.label}>×</button>
                  </span>
                ))}
              </div>
            </div>
            <PropertyGrid
              propiedades={lista}
              vacio={(
                <EmptyState glyph="🏘️" title="No hay propiedades con esos filtros">
                  <p>Prueba ampliando el precio máximo o eligiendo otra comuna.</p>
                </EmptyState>
              )}
            />
          </div>
        </div>
      </section>
    </>
  );
}
