import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminHeader, ConfirmDeleteModal, EmptyState } from "../../components/ui";
import * as store from "../../services/store";
import { useToast } from "../../context/ToastContext";
import { useStoreVersion } from "../../hooks/useStore";
import useTitle from "../../hooks/useTitle";

/* Gestión de categorías (solo Administrador). Una categoría solo se puede
   eliminar si ninguna propiedad la está usando. */
export default function CategoriasAdmin() {
  useTitle("Categorías — Panel AuraArriendos");
  useStoreVersion();
  const toast = useToast();
  const [eliminar, setEliminar] = useState(null);
  const categorias = store.getCategorias();
  const propiedades = store.getPropiedades();
  const contar = (c) => propiedades.filter((p) => p.categoria === c.nombre).length;

  function confirmar() {
    const ok = store.eliminarCategoria(eliminar);
    setEliminar(null);
    toast(ok ? "Categoría eliminada" : "No se puede eliminar: hay propiedades usando esta categoría.", "error");
  }

  return (
    <>
      <AdminHeader eyebrow="Catálogo" title={"Categorías (" + categorias.length + ")"}>
        <Link to="/admin/categorias/nueva" className="btn btn-primary">+ Nueva categoría</Link>
      </AdminHeader>
      {categorias.length ? (
        <div className="row g-3 row-cols-1 row-cols-md-2 row-cols-xl-3">
          {categorias.map((c) => (
            <div className="col" key={c.id}>
              <div className="card h-100">
                <img src={c.imagen} className="card-img-top" alt={c.nombre} style={{ aspectRatio: "16 / 9", objectFit: "cover" }} />
                <div className="card-body">
                  <h2 className="h5 mb-1">{c.nombre}</h2>
                  <p className="small text-mute mb-2">{c.descripcion}</p>
                  <span className="chip">{contar(c)} propiedades</span>
                </div>
                <div className="card-footer bg-transparent d-flex gap-2">
                  <Link to={"/categorias/" + c.id} className="btn btn-outline-secondary btn-sm" target="_blank" rel="noopener">Ver</Link>
                  <Link to={"/admin/categorias/" + c.id + "/editar"} className="btn btn-outline-secondary btn-sm">Editar</Link>
                  <button type="button" className="btn btn-danger btn-sm ms-auto" onClick={() => setEliminar(c.id)} disabled={contar(c) > 0} title={contar(c) > 0 ? "Tiene propiedades asociadas" : ""}>Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState glyph="🏷️" title="No hay categorías" />
      )}
      <ConfirmDeleteModal
        open={!!eliminar}
        title="Eliminar categoría"
        message="¿Confirmas que deseas eliminar esta categoría?"
        onCancel={() => setEliminar(null)}
        onConfirm={confirmar}
      />
    </>
  );
}
