import { useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import AdminTabs from "../../components/AdminTabs";
import { AdminHeader, ConfirmDeleteModal, EmptyState, Modal, StatusPill } from "../../components/ui";
import * as store from "../../services/store";
import { useToast } from "../../context/ToastContext";
import { useStoreVersion } from "../../hooks/useStore";
import useTitle from "../../hooks/useTitle";
import { enOferta, formatPrice, getMainImage, precioFinal } from "../../services/format";

/* Listado de propiedades. Administrador y Agente aprueban, rechazan y marcan
   arrendada; editar, eliminar y crear son solo del Administrador. */
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

  function aprobar(p) {
    const actualizada = { ...p, estado: "publicada" };
    delete actualizada.motivoRechazo;
    store.guardarPropiedad(actualizada);
    toast("Publicación aprobada", "success");
  }

  function marcarArrendada(p, valor) {
    store.marcarArrendada(p.id, valor);
    toast(valor ? "Marcada como arrendada: oculta del sitio público" : "Propiedad visible nuevamente en el sitio", "success");
  }

  function confirmarRechazo(e) {
    e.preventDefault();
    const p = store.getPropiedadPorId(rechazarId);
    if (p) {
      store.guardarPropiedad({ ...p, estado: "rechazada", motivoRechazo: motivo.trim() || "No especificado." });
      toast("Publicación rechazada", "error");
    }
    setRechazarId(null);
  }

  function confirmarEliminar() {
    store.eliminarPropiedad(eliminarId);
    setEliminarId(null);
    toast("Propiedad eliminada", "error");
  }

  return (
    <>
      <AdminHeader eyebrow="Gestión" title={"Propiedades (" + lista.length + ")"}>
        <Link to="/admin/stock-critico" className="btn btn-outline-secondary">⚠️ Stock crítico</Link>
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
                    {p.estado === "pendiente" && (
                      <>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => aprobar(p)}>Aprobar</button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => { setMotivo(""); setRechazarId(p.id); }}>Rechazar</button>
                      </>
                    )}
                    {p.estado === "publicada" && (p.arrendada
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
