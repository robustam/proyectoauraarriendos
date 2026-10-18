import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { AdminHeader, ConfirmDeleteModal, EmptyState } from "../../components/ui";
import * as store from "../../services/store";
import { useToast } from "../../context/ToastContext";
import { useStoreVersion } from "../../hooks/useStore";
import useTitle from "../../hooks/useTitle";

export default function Usuarios() {
  useTitle("Usuarios — Panel AuraArriendos");
  useStoreVersion();
  const { sesion } = useOutletContext();
  const toast = useToast();
  const [eliminar, setEliminar] = useState(null);
  const [buscar, setBuscar] = useState("");

  const q = buscar.trim().toLowerCase();
  const lista = store.getUsuarios().filter((u) =>
    !q || (u.nombre + " " + u.apellidos + " " + u.correo + " " + u.run).toLowerCase().includes(q));

  function confirmar() {
    store.eliminarUsuario(eliminar);
    setEliminar(null);
    toast("Usuario eliminado", "error");
  }

  return (
    <>
      <AdminHeader eyebrow="Gestión" title={"Usuarios (" + lista.length + ")"}>
        <Link to="/admin/usuarios/nuevo" className="btn btn-primary">+ Nuevo usuario</Link>
      </AdminHeader>

      <div className="mb-3" style={{ maxWidth: 360 }}>
        <input type="search" className="form-control" placeholder="Buscar por nombre, correo o RUN" aria-label="Buscar usuarios" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
      </div>

      <div className="table-responsive table-card">
        <table className="table table-hover align-middle">
          <thead><tr><th>Nombre</th><th>Correo</th><th>RUN</th><th>Tipo</th><th>Comuna</th><th>Acciones</th></tr></thead>
          <tbody>
            {lista.length ? lista.map((u) => (
              <tr key={u.correo}>
                <td><Link to={"/admin/usuarios/" + encodeURIComponent(u.correo)} className="fw-semibold text-body">{u.nombre} {u.apellidos}</Link></td>
                <td>{u.correo}</td>
                <td>{u.run}</td>
                <td><span className="chip">{u.tipoUsuario}</span></td>
                <td>{u.comuna || "—"}</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <Link to={"/admin/usuarios/" + encodeURIComponent(u.correo)} className="btn btn-outline-secondary btn-sm">Ver</Link>
                    <Link to={"/admin/usuarios/" + encodeURIComponent(u.correo) + "/editar"} className="btn btn-outline-secondary btn-sm">Editar</Link>
                    {/* No se puede eliminar la propia cuenta. */}
                    {u.correo !== sesion.correo && (
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => setEliminar(u.correo)}>Eliminar</button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6}><EmptyState glyph="👤" title="No hay usuarios que coincidan" /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        open={!!eliminar}
        title="Eliminar usuario"
        message="Esta acción no se puede deshacer. ¿Confirmas que deseas eliminar este usuario?"
        onCancel={() => setEliminar(null)}
        onConfirm={confirmar}
      />
    </>
  );
}
