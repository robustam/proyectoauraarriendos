import { useState } from "react";
import { Link } from "react-router-dom";
import AdminTabs from "../../components/AdminTabs";
import { AdminHeader, EmptyState, StatusPill } from "../../components/ui";
import * as store from "../../services/store";
import { useStoreVersion } from "../../hooks/useStore";
import useTitle from "../../hooks/useTitle";
import { formatFechaHora, formatPrice } from "../../utils/format";

/* "Órdenes / Boletas": todas las reservas pagadas o rechazadas del sitio. */
const TABS = [
  { key: "todas", label: "Todas" },
  { key: "pagada", label: "Pagadas" },
  { key: "rechazada", label: "Rechazadas" }
];

export default function Ordenes() {
  useTitle("Órdenes — Panel AuraArriendos");
  useStoreVersion();
  const [tab, setTab] = useState("todas");
  const [buscar, setBuscar] = useState("");

  const q = buscar.trim().toLowerCase();
  const lista = store.getOrdenes()
    .filter((o) => tab === "todas" || o.estado === tab)
    .filter((o) => !q || (String(o.numero) + " " + o.cliente.nombre + " " + o.cliente.apellidos + " " + o.cliente.correo).toLowerCase().includes(q));
  const totalPagado = lista.filter((o) => o.estado === "pagada").reduce((a, o) => a + o.total, 0);

  return (
    <>
      <AdminHeader eyebrow="Ventas" title={"Órdenes y boletas (" + lista.length + ")"} />
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-1">
        <AdminTabs tabs={TABS} active={tab} onChange={setTab} />
        <input type="search" className="form-control mb-3" style={{ maxWidth: 320 }} placeholder="Buscar por N° o cliente" aria-label="Buscar órdenes" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
      </div>
      <div className="table-responsive table-card">
        <table className="table table-hover align-middle">
          <thead><tr><th>N° orden</th><th>Fecha</th><th>Cliente</th><th>Propiedades</th><th className="text-end">Total</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {lista.length ? lista.map((o) => (
              <tr key={o.id}>
                <td className="fw-semibold">#{o.numero}</td>
                <td className="small text-nowrap">{formatFechaHora(o.fecha)}</td>
                <td>{o.cliente.nombre} {o.cliente.apellidos}<br /><span className="small text-mute">{o.cliente.correo}</span></td>
                <td>{o.items.length}</td>
                <td className="text-end">{formatPrice(o.total)}</td>
                <td><StatusPill estado={o.estado} /></td>
                <td className="text-end"><Link to={"/admin/ordenes/" + o.id} className="btn btn-outline-secondary btn-sm">Mostrar boleta</Link></td>
              </tr>
            )) : (
              <tr><td colSpan={7}><EmptyState glyph="🧾" title="No hay órdenes para mostrar" /></td></tr>
            )}
          </tbody>
          {lista.length > 0 && (
            <tfoot>
              <tr><td colSpan={4} className="text-end fw-semibold">Total pagado en esta vista</td><td className="text-end fw-bold">{formatPrice(totalPagado)}</td><td colSpan={2}></td></tr>
            </tfoot>
          )}
        </table>
      </div>
    </>
  );
}
