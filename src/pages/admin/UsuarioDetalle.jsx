import { Link, Navigate, useParams } from "react-router-dom";
import { AdminHeader, EmptyState, StatusPill } from "../../components/ui";
import * as store from "../../services/store";
import { useStoreVersion } from "../../hooks/useStore";
import useTitle from "../../hooks/useTitle";
import { formatFechaHora, formatFechaLarga, formatPrice } from "../../services/format";

/* "Mostrar usuario" con su "Historial de compras" (órdenes) y sus publicaciones. */
export default function UsuarioDetalle() {
  useStoreVersion();
  const { correo } = useParams();
  const u = store.getUsuarioPorCorreo(correo);
  useTitle((u ? u.nombre + " " + u.apellidos : "Usuario") + " — Panel AuraArriendos");
  if (!u) return <Navigate to="/admin/usuarios" replace />;

  const ordenes = store.getOrdenesDeUsuario(u.correo);
  const totalPagado = ordenes.filter((o) => o.estado === "pagada").reduce((a, o) => a + o.total, 0);
  const publicaciones = store.getPropiedades().filter((p) => p.publicadoPor === u.correo);

  return (
    <>
      <AdminHeader eyebrow={u.tipoUsuario} title={u.nombre + " " + u.apellidos}>
        <Link to="/admin/usuarios" className="btn btn-outline-secondary">← Volver</Link>
        <Link to={"/admin/usuarios/" + encodeURIComponent(u.correo) + "/editar"} className="btn btn-primary">Editar usuario</Link>
      </AdminHeader>

      <div className="row g-4">
        <div className="col-xl-4">
          <div className="card p-4 h-100">
            <h2 className="h5 mb-3">Datos</h2>
            <dl className="row small mb-0">
              <dt className="col-5 text-mute fw-normal">RUN</dt><dd className="col-7">{u.run}</dd>
              <dt className="col-5 text-mute fw-normal">Correo</dt><dd className="col-7 text-break">{u.correo}</dd>
              <dt className="col-5 text-mute fw-normal">Nacimiento</dt><dd className="col-7">{u.fechaNacimiento ? formatFechaLarga(u.fechaNacimiento) : "—"}</dd>
              <dt className="col-5 text-mute fw-normal">Dirección</dt><dd className="col-7">{u.direccion}</dd>
              <dt className="col-5 text-mute fw-normal">Comuna</dt><dd className="col-7">{u.comuna}, {u.region}</dd>
              <dt className="col-5 text-mute fw-normal">Publicaciones</dt><dd className="col-7">{publicaciones.length}</dd>
            </dl>
          </div>
        </div>
        <div className="col-xl-8">
          <div className="card p-4 h-100">
            <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
              <h2 className="h5 mb-0">Historial de compras ({ordenes.length})</h2>
              <span className="small">Total pagado: <strong>{formatPrice(totalPagado)}</strong></span>
            </div>
            {ordenes.length ? (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead><tr><th>N°</th><th>Fecha</th><th>Propiedades</th><th>Total</th><th>Estado</th><th></th></tr></thead>
                  <tbody>
                    {ordenes.map((o) => (
                      <tr key={o.id}>
                        <td>#{o.numero}</td>
                        <td className="small">{formatFechaHora(o.fecha)}</td>
                        <td className="small">{o.items.map((it) => it.nombre).join(", ")}</td>
                        <td>{formatPrice(o.total)}</td>
                        <td><StatusPill estado={o.estado} /></td>
                        <td className="text-end"><Link to={"/admin/ordenes/" + o.id} className="btn btn-outline-secondary btn-sm">Boleta</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <EmptyState glyph="🧾" title="Este usuario no tiene compras" />}
          </div>
        </div>
      </div>
    </>
  );
}
