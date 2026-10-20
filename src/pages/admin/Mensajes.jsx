import { useState } from "react";
import AdminTabs from "../../components/AdminTabs";
import { AdminHeader, ConfirmDeleteModal, EmptyState, Modal, StatusPill } from "../../components/ui";
import * as store from "../../services/store";
import { useToast } from "../../context/ToastContext";
import { useStoreVersion } from "../../hooks/useStore";
import useTitle from "../../hooks/useTitle";
import { formatFechaHora, recortar } from "../../services/format";

/* Inbox con los mensajes del formulario de contacto (solo Administrador). */
const TABS = [
  { key: "todos", label: "Todos" },
  { key: "nuevos", label: "No leídos" },
  { key: "leidos", label: "Leídos" }
];

export default function Mensajes() {
  useTitle("Inbox — Panel AuraArriendos");
  useStoreVersion();
  const toast = useToast();
  const [filtro, setFiltro] = useState("todos");
  const [verId, setVerId] = useState(null);
  const [eliminar, setEliminar] = useState(null);

  let lista = store.getMensajes();
  if (filtro === "nuevos") lista = lista.filter((m) => !m.leido);
  if (filtro === "leidos") lista = lista.filter((m) => m.leido);
  const viendo = verId ? store.getMensajes().find((m) => m.id === verId) : null;

  function ver(m) {
    setVerId(m.id);
    if (!m.leido) store.marcarMensajeLeido(m.id, true);
  }

  function confirmar() {
    store.eliminarMensaje(eliminar);
    setEliminar(null);
    toast("Mensaje eliminado", "error");
  }

  return (
    <>
      <AdminHeader eyebrow="Formulario de contacto" title={"Inbox (" + lista.length + ")"} />
      <AdminTabs tabs={TABS} active={filtro} onChange={setFiltro} />

      <div className="table-responsive table-card">
        <table className="table table-hover align-middle">
          <thead><tr><th>Estado</th><th>Fecha</th><th>Nombre</th><th>Correo</th><th>Mensaje</th><th>Acciones</th></tr></thead>
          <tbody>
            {lista.length ? lista.map((m) => (
              <tr key={m.id} className={m.leido ? "" : "row-unread"}>
                <td><StatusPill estado={m.leido ? "leido" : "nuevo"} label={m.leido ? "leído" : "nuevo"} /></td>
                <td className="text-nowrap small">{formatFechaHora(m.fecha)}</td>
                <td>{m.nombre}</td>
                <td>{m.correo}</td>
                <td>{recortar(m.comentario, 80)}</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => ver(m)}>Ver</button>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => store.marcarMensajeLeido(m.id, !m.leido)}>
                      {m.leido ? "Marcar no leído" : "Marcar leído"}
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => setEliminar(m.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6}><EmptyState glyph="📭" title="No hay mensajes aquí"><p className="mb-0">Los mensajes del formulario de contacto aparecerán en esta bandeja.</p></EmptyState></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!viendo}
        title={viendo ? viendo.nombre : ""}
        onClose={() => setVerId(null)}
        actions={viendo && (
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setVerId(null)}>Cerrar</button>
            <a className="btn btn-primary" href={"mailto:" + encodeURIComponent(viendo.correo) + "?subject=" + encodeURIComponent("Re: tu mensaje a AuraArriendos")}>
              Responder por correo
            </a>
          </>
        )}
      >
        {viendo && (
          <>
            <p className="small text-mute">{viendo.correo} · {formatFechaHora(viendo.fecha)}</p>
            <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{viendo.comentario}</p>
          </>
        )}
      </Modal>

      <ConfirmDeleteModal
        open={!!eliminar}
        title="Eliminar mensaje"
        message="Esta acción no se puede deshacer. ¿Confirmas que deseas eliminar este mensaje?"
        onCancel={() => setEliminar(null)}
        onConfirm={confirmar}
      />
    </>
  );
}
