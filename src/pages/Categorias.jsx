import { Link, useParams } from "react-router-dom";
import Reveal from "../components/Reveal";
import PropertyGrid from "../components/PropertyGrid";
import { EmptyState } from "../components/ui";
import * as store from "../services/store";
import { useStoreVersion } from "../hooks/useStore";
import useTitle from "../hooks/useTitle";
import { publicadas } from "../utils/format";

/* Vista "Categorías": arriba las tarjetas de cada categoría y abajo sus
   propiedades. /categorias muestra todas; /categorias/:id solo una. */
export default function Categorias() {
  useStoreVersion();
  const { id } = useParams();
  const categorias = store.getCategorias();
  const disponibles = publicadas(store.getPropiedades());
  const activa = id ? store.getCategoriaPorId(id) : null;
  useTitle((activa ? activa.nombre : "Categorías") + " — AuraArriendos");

  const contar = (c) => disponibles.filter((p) => p.categoria === c.nombre).length;
  const mostrar = activa ? [activa] : categorias;

  return (
    <>
      <Reveal as="section" className="page-hero container">
        <p className="eyebrow">Explora por categoría</p>
        <h1>{activa ? activa.nombre : "Categorías"}</h1>
        <p className="lede">{activa ? activa.descripcion : "Elige el tipo de inmueble que buscas y revisa solo lo que te interesa."}</p>
      </Reveal>

      <section className="container pb-4">
        <div className="row g-3 row-cols-2 row-cols-md-4 justify-content-center">
          {categorias.map((c) => (
            <div className="col" key={c.id}>
              <Link to={"/categorias/" + c.id} className={"card category-chip h-100 text-center" + (activa && activa.id === c.id ? " active" : "")}>
                <img src={c.imagen} className="card-img-top" alt={c.nombre} />
                <div className="card-body py-2">
                  <strong className="d-block">{c.nombre}</strong>
                  <small className="text-mute">{contar(c)} disponibles</small>
                </div>
              </Link>
            </div>
          ))}
        </div>
        {activa && <p className="text-center mt-3 mb-0"><Link to="/categorias">← Ver todas las categorías</Link></p>}
      </section>

      {id && !activa ? (
        <section className="container section-tight">
          <EmptyState glyph="🏷️" title="Esa categoría no existe"><Link to="/categorias" className="btn btn-primary">Ver categorías</Link></EmptyState>
        </section>
      ) : (
        mostrar.map((c) => (
          <section className="container section-tight" key={c.id}>
            <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
              <h2 className="h3 mb-0">{c.nombre}</h2>
              <Link to={"/propiedades?categoria=" + encodeURIComponent(c.nombre)} className="small fw-semibold">Filtrar en el catálogo →</Link>
            </div>
            <PropertyGrid
              columnas={4}
              propiedades={disponibles.filter((p) => p.categoria === c.nombre)}
              vacio={<EmptyState glyph="🏷️" title="Aún no hay propiedades en esta categoría" />}
            />
          </section>
        ))
      )}
    </>
  );
}
