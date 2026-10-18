import { Link, Navigate, useParams } from "react-router-dom";
import BoletaDetalle from "../../components/BoletaDetalle";
import { AdminHeader, StatusPill } from "../../components/ui";
import * as store from "../../services/store";
import useTitle from "../../hooks/useTitle";

/* "Mostrar boleta": detalle de una orden en el panel. */
export default function OrdenDetalle() {
  const { id } = useParams();
  const orden = store.getOrdenPorId(id);
  useTitle("Boleta #" + (orden ? orden.numero : "") + " — Panel AuraArriendos");
  if (!orden) return <Navigate to="/admin/ordenes" replace />;

  const cliente = store.getUsuarioPorCorreo(orden.usuarioCorreo);

  return (
    <>
      <AdminHeader eyebrow={"Orden " + orden.id} title={"Boleta #" + orden.numero}>
        <Link to="/admin/ordenes" className="btn btn-outline-secondary no-print">← Volver</Link>
        {cliente && <Link to={"/admin/usuarios/" + encodeURIComponent(cliente.correo)} className="btn btn-outline-secondary no-print">Ver cliente</Link>}
        <button type="button" className="btn btn-primary no-print" onClick={() => window.print()}>Imprimir</button>
      </AdminHeader>
      <div className="form-panel" style={{ maxWidth: 900 }}>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <StatusPill estado={orden.estado} />
          {orden.estado === "rechazada" && <span className="small text-danger">{orden.motivoRechazo}</span>}
        </div>
        <BoletaDetalle orden={orden} />
      </div>
    </>
  );
}
