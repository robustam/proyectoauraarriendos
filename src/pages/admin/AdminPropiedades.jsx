import { useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import AdminTabs from "../../components/AdminTabs";
import { AdminHeader, ConfirmDeleteModal, EmptyState, Modal, StatusPill } from "../../components/ui";
import * as store from "../../services/store";
import { useToast } from "../../context/ToastContext";
import { useStoreVersion } from "../../hooks/useStore";
import useTitle from "../../hooks/useTitle";
import { enOferta, formatPrice, getMainImage, precioFinal } from "../../services/format";

/* Listado de propiedades. El Administrador aprueba, rechaza, marca arrendada,
   edita, elimina y crea. El Vendedor solo puede ver el listado y el detalle. */
const TABS = [
  { key: "todas", label: "Todas" },
  { key: "publicada", label: "Publicadas" },
  { key: "pendiente", label: "Pendientes" },
  { key: "rechazada", label: "Rechazadas" },
  { key: "arrendada", label: "Arrendadas" }
];

export function filtrarPorEstado(lista, estado) {
  if (estado === "arrendada") return lista.filter((p) => !!p.arrendada);
  if (estado === "publicada") return lista.filter((p) => p.estado === "publicada" && !p.arrendada);
  if (estado && estado !== "todas") return lista.filter((p) => p.estado === estado);
  return lista;
}

export default function AdminPropiedades() {
  useTitle("Propiedades — Panel AuraArriendos");
  useStoreVersion();
  const { esAdmin } = useOutletContext();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const estadoActivo = params.get("estado") || "todas";

  const [rechazarId, setRechazarId] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [eliminarId, setEliminarId] = useState(null);

  /* Pendientes primero; el resto mantiene su orden. */
  const lista = filtrarPorEstado(store.getPropiedades(), estadoActivo)
    .map((p, i) => ({ p, i }))
    .sort((a, b) => (a.p.estado === "pendiente" ? 0 : 1) - (b.p.estado === "pendiente" ? 0 : 1) || a.i - b.i)
    .map((x) => x.p);

  /* Cada acción llama a la API; si el backend la rechaza se muestra su mensaje. */
  async function intentar(accion, mensajeOk, tipo = "success") {
    try {
      await accion();
      toast(mensajeOk, tipo);
    } catch (error) {
      toast(error.message, "error");
    }
  }

  function aprobar(p) {
    return intentar(() => store.cambiarEstadoPropiedad(p.id, "publicada"), "Publicación aprobada");
  }

  function marcarArrendada(p, valor) {
    return intentar(() => store.marcarArrendada(p.id, valor),
      valor ? "Marcada como arrendada: oculta del sitio público" : "Propiedad visible nuevamente en el sitio");
  }

  async function confirmarRechazo(e) {
    e.preventDefault();
    const id = rechazarId;
    setRechazarId(null);
    await intentar(() => store.cambiarEstadoPropiedad(id, "rechazada", motivo.trim() || "No especificado."),
      "Publicación rechazada", "error");
  }

  async function confirmarEliminar() {
    const id = eliminarId;
    setEliminarId(null);
    await intentar(() => store.eliminarPropiedad(id), "Propiedad eliminada", "error");
  }

  return (
    <>
      <AdminHeader eyebrow="Gestión" title={"Propiedades (" + lista.length + ")"}>
        {esAdmin && <Link to="/admin/stock-critico" className="btn btn-outline-secondary">⚠️ Stock crítico</Link>}
        {esAdmin && <Link to="/admin/propiedades/nueva" className="btn btn-primary">+ Nueva propiedad</Link>}
      </AdminHeader>

      <AdminTabs tabs={TABS} active={estadoActivo} onChange={(key) => setParams({ estado: key }, { replace: true })} />

      <div className="table-responsive table-card">
        <table className="table table-hover align-middle">
          <thead>
            <tr><th>Imagen</th><th>Nombre</th><th>Tipo</th><th>Comuna</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {lista.length ? lista.map((p) => (
              <tr key={p.id}>
                <td><img src={getMainImage(p)} className="thumb-xs" alt="" /></td>
                <td><Link to={"/admin/propiedades/" + encodeURIComponent(p.id)} className="fw-semibold text-body">{p.nombre}</Link><br /><span className="small text-mute">{p.codigo}</span></td>
                <td>{p.categoria}</td>
                <td>{p.comuna}</td>
                <td className="text-nowrap">{formatPrice(precioFinal(p))}{enOferta(p) && <span className="badge badge-oferta ms-1">oferta</span>}</td>
                <td>{p.unidadesDisponibles}</td>
                <td><StatusPill estado={p.arrendada ? "arrendada" : p.estado} /></td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <Link to={"/admin/propiedades/" + encodeURIComponent(p.id)} className="btn btn-outline-secondary btn-sm">Ver</Link>
                    {esAdmin && <Link to={"/admin/propiedades/" + encodeURIComponent(p.id) + "/editar"} className="btn btn-outline-secondary btn-sm">Editar</Link>}
                    {esAdmin && p.estado === "pendiente" && (
                      <>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => aprobar(p)}>Aprobar</button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => { setMotivo(""); setRechazarId(p.id); }}>Rechazar</button>
                      </>
                    )}
                    {esAdmin && p.estado === "publicada" && (p.arrendada
                      ? <button type="button" className="btn btn-primary btn-sm" onClick={() => marcarArrendada(p, false)}>Reactivar</button>
                      : <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => marcarArrendada(p, true)}>Marcar arrendada</button>)}
                    {esAdmin && <button type="button" className="btn btn-danger btn-sm" onClick={() => setEliminarId(p.id)}>Eliminar</button>}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={8}><EmptyState glyph="🏘️" title="No hay propiedades en este estado" /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!rechazarId} title="Rechazar publicación" onClose={() => setRechazarId(null)}>
        <form onSubmit={confirmarRechazo}>
          <label htmlFor="reject-reason" className="form-label">Motivo del rechazo</label>
          <textarea
            id="reject-reason" className="form-control mb-3" rows={3} autoFocus value={motivo} onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej: fotografías insuficientes, información incompleta…"
          />
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setRechazarId(null)}>Cancelar</button>
            <button type="submit" className="btn btn-danger">Confirmar rechazo</button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        open={!!eliminarId}
        title="Eliminar propiedad"
        message="Esta acción no se puede deshacer. ¿Confirmas que deseas eliminar esta propiedad?"
        onCancel={() => setEliminarId(null)}
        onConfirm={confirmarEliminar}
      />
    </>
  );
}
