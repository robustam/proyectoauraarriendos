import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminHeader, ConfirmDeleteModal, EmptyState } from "../../components/ui";
import * as store from "../../services/store";
import { useToast } from "../../context/ToastContext";
import { useStoreVersion } from "../../hooks/useStore";
import useTitle from "../../hooks/useTitle";
import { formatFechaLarga } from "../../services/format";

export default function AdminBlog() {
  useTitle("Blog — Panel AuraArriendos");
  useStoreVersion();
  const toast = useToast();
  const [eliminar, setEliminar] = useState(null);
  const lista = store.getBlog();

  function confirmar() {
    store.eliminarPost(eliminar);
    setEliminar(null);
    toast("Publicación eliminada", "error");
  }

  return (
    <>
      <AdminHeader eyebrow="Contenido" title={"Blog (" + lista.length + ")"}>
        <Link to="/admin/blog/nueva" className="btn btn-primary">+ Nueva publicación</Link>
      </AdminHeader>

      <div className="table-responsive table-card">
        <table className="table table-hover align-middle">
          <thead><tr><th>Imagen</th><th>Título</th><th>Fecha</th><th>Autor</th><th>Acciones</th></tr></thead>
          <tbody>
            {lista.length ? lista.map((b) => (
              <tr key={b.id}>
                <td><img src={b.imagen} className="thumb-xs" alt="" /></td>
                <td><strong>{b.titulo}</strong><br /><span className="small text-mute">{b.resumen}</span></td>
                <td className="text-nowrap">{formatFechaLarga(b.fecha)}</td>
                <td>{b.autor}</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <Link to={"/blog/" + encodeURIComponent(b.id)} className="btn btn-outline-secondary btn-sm" target="_blank" rel="noopener">Ver</Link>
                    <Link to={"/admin/blog/" + encodeURIComponent(b.id) + "/editar"} className="btn btn-outline-secondary btn-sm">Editar</Link>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => setEliminar(b.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5}><EmptyState glyph="📝" title="Aún no hay publicaciones"><p>Crea la primera con “+ Nueva publicación”.</p></EmptyState></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        open={!!eliminar}
        title="Eliminar publicación"
        message="Esta acción no se puede deshacer. ¿Confirmas que deseas eliminar esta publicación del blog?"
        onCancel={() => setEliminar(null)}
        onConfirm={confirmar}
      />
    </>
  );
}
