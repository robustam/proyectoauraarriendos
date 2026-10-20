import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import PropertyGrid from "../components/PropertyGrid";
import { EmptyState } from "../components/ui";
import * as store from "../services/store";
import { useStoreVersion } from "../hooks/useStore";
import useTitle from "../hooks/useTitle";
import { enOferta, porcentajeDescuento, publicadas } from "../services/format";

/* Vista "Ofertas": propiedades publicadas que tienen un precio rebajado,
   ordenadas de mayor a menor descuento. */
export default function Ofertas() {
  useTitle("Ofertas — AuraArriendos");
  useStoreVersion();
  const ofertas = publicadas(store.getPropiedades())
    .filter(enOferta)
    .sort((a, b) => porcentajeDescuento(b) - porcentajeDescuento(a));

  return (
    <>
      <Reveal as="section" className="page-hero container">
        <p className="eyebrow">Precios rebajados</p>
        <h1>Ofertas de arriendo</h1>
        <p className="lede">Propiedades con un precio especial por tiempo limitado. El descuento se aplica a la reserva y al arriendo mensual.</p>
      </Reveal>
      <section className="container section-tight pt-0">
        <PropertyGrid
          columnas={4}
          propiedades={ofertas}
          vacio={(
            <EmptyState glyph="🏷️" title="No hay ofertas vigentes">
              <p>Vuelve pronto o revisa el catálogo completo.</p>
              <Link to="/propiedades" className="btn btn-primary">Ver propiedades</Link>
            </EmptyState>
          )}
        />
      </section>
    </>
  );
}
