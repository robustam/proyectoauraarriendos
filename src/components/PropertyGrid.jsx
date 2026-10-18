import PropertyCard from "./PropertyCard";
import { EmptyState } from "./ui";
import useSolicitudToggle from "../hooks/useSolicitudToggle";

/* Grilla responsiva de propiedades con la grilla de Bootstrap:
   1 columna en celular, 2 en tablet, 3 en escritorio (o 4 con `columnas={4}`).
   Si la lista viene vacía muestra `vacio` (o un mensaje por defecto). */
export default function PropertyGrid({ propiedades, columnas = 3, vacio }) {
  const { toggle, isSaved } = useSolicitudToggle();

  if (!propiedades.length) {
    return vacio || <EmptyState glyph="🏘️" title="No hay propiedades para mostrar" />;
  }

  const cols = columnas === 4 ? "row-cols-xl-4" : "";
  return (
    <div className={"row g-4 row-cols-1 row-cols-sm-2 row-cols-lg-3 " + cols}>
      {propiedades.map((p) => (
        <div className="col" key={p.id}>
          <PropertyCard propiedad={p} guardada={isSaved(p.id)} onToggleGuardar={toggle} />
        </div>
      ))}
    </div>
  );
}
