import { Link, useOutletContext } from "react-router-dom";
import { AdminHeader, EmptyState, StatusPill } from "../../components/ui";
import * as store from "../../services/store";
import { useStoreVersion } from "../../hooks/useStore";
import useTitle from "../../hooks/useTitle";
import { getMainImage } from "../../utils/format";

/* "Listado de productos críticos": propiedades cuyo stock (unidades
   disponibles) está en o bajo el nivel de alerta configurado. */
export default function StockCritico() {
  useTitle("Stock crítico — Panel AuraArriendos");
  useStoreVersion();
  const { esAdmin } = useOutletContext();
  const lista = store.getPropiedadesCriticas().sort((a, b) => a.unidadesDisponibles - b.unidadesDisponibles);

  return (
    <>
      <AdminHeader eyebrow="Inventario" title={"Stock crítico (" + lista.length + ")"}>
        <Link to="/admin/propiedades" className="btn btn-outline-secondary">← Todas las propiedades</Link>
      </AdminHeader>
      <p className="lede mb-3">Propiedades con unidades disponibles iguales o menores a su "stock crítico". Cada reserva pagada descuenta una unidad.</p>
      <div className="table-responsive table-card">
        <table className="table table-hover align-middle">
          <thead><tr><th>Imagen</th><th>Propiedad</th><th>Comuna</th><th>Stock</th><th>Crítico</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {lista.length ? lista.map((p) => (
              <tr key={p.id} className={Number(p.unidadesDisponibles) === 0 ? "table-danger" : "table-warning"}>
                <td><img src={getMainImage(p)} className="thumb-xs" alt="" /></td>
                <td><strong>{p.nombre}</strong><br /><span className="small text-mute">{p.codigo}</span></td>
                <td>{p.comuna}</td>
                <td><span className={"badge " + (Number(p.unidadesDisponibles) === 0 ? "text-bg-danger" : "text-bg-warning")}>{p.unidadesDisponibles}</span></td>
                <td>{p.alertaDisponibilidad}</td>
                <td><StatusPill estado={p.arrendada ? "arrendada" : p.estado} /></td>
                <td className="text-end text-nowrap">
                  <Link to={"/admin/propiedades/" + encodeURIComponent(p.id)} className="btn btn-outline-secondary btn-sm me-1">Ver</Link>
                  {esAdmin && <Link to={"/admin/propiedades/" + encodeURIComponent(p.id) + "/editar"} className="btn btn-primary btn-sm">Reponer stock</Link>}
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7}><EmptyState glyph="✅" title="Ninguna propiedad está en stock crítico" /></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
