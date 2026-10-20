import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { AdminHeader, FormAlert, FormField, ImagePicker } from "../../components/ui";
import * as store from "../../services/store";
import { useToast } from "../../context/ToastContext";
import useForm from "../../hooks/useForm";
import useTitle from "../../hooks/useTitle";
import * as V from "../../services/validators";

/* Nueva / editar categoría. Reglas: nombre req. máx. 40 y único,
   descripción opcional máx. 200, imagen opcional. */
function Formulario({ existente }) {
  const navigate = useNavigate();
  const toast = useToast();
  const editando = !!existente;
  const [alert, setAlert] = useState(null);

  const inicial = useMemo(() => ({
    nombre: editando ? existente.nombre : "",
    descripcion: editando ? existente.descripcion || "" : "",
    imagen: editando ? existente.imagen || "" : ""
  }), [editando, existente]);

  const rules = useMemo(() => ({
    nombre: (v) => {
      if (!(V.requerido(v) && V.largoEntre(v, 1, 40))) return "Requerido, máximo 40 caracteres.";
      const repetida = store.getCategorias().some((c) => c.nombre.toLowerCase() === v.trim().toLowerCase() && (!editando || c.id !== existente.id));
      return repetida ? "Ya existe una categoría con ese nombre." : null;
    },
    descripcion: (v) => (V.largoEntre(v, 0, 200) ? null : "Máximo 200 caracteres.")
  }), [editando, existente]);

  const form = useForm(inicial, rules);
  const { values, status, bind } = form;

  function onSubmit(e) {
    e.preventDefault();
    if (!form.validateAll()) {
      setAlert({ type: "error", text: "Revisa los campos marcados en rojo." });
      return;
    }
    store.guardarCategoria({
      id: editando ? existente.id : store.nuevoIdCategoria(values.nombre),
      nombre: values.nombre.trim(),
      descripcion: values.descripcion.trim(),
      imagen: values.imagen || "/img/prop-1.jpg"
    });
    toast(editando ? "Categoría actualizada" : "Categoría creada", "success");
    navigate("/admin/categorias");
  }

  return (
    <>
      <AdminHeader eyebrow="Catálogo" title={editando ? "Editar categoría" : "Nueva categoría"}>
        <Link to="/admin/categorias" className="btn btn-outline-secondary">← Volver</Link>
      </AdminHeader>
      <form className="form-panel" style={{ maxWidth: 640 }} onSubmit={onSubmit} noValidate aria-label="Formulario de categoría">
        <FormAlert alert={alert} />
        <div className="row g-3">
          <FormField label="Nombre" htmlFor="cat-nombre" status={status.nombre} hint={editando ? "Si cambias el nombre, se actualiza en todas sus propiedades." : undefined}>
            <input className="form-control" {...bind("nombre", "cat-")} maxLength={40} />
          </FormField>
          <FormField label="Descripción (opcional)" htmlFor="cat-descripcion" status={status.descripcion} hint={values.descripcion.length + " / 200"}>
            <textarea className="form-control" rows={3} {...bind("descripcion", "cat-")} maxLength={200} />
          </FormField>
          <FormField label="Imagen (opcional)" htmlFor="cat-imagen">
            <ImagePicker id="cat-imagen" value={values.imagen} onChange={(img) => form.setSilently({ imagen: img })} />
          </FormField>
          <div className="col-12 d-grid">
            <button type="submit" className="btn btn-primary">Guardar categoría</button>
          </div>
        </div>
      </form>
    </>
  );
}

export default function CategoriaForm() {
  const { id } = useParams();
  const existente = id ? store.getCategoriaPorId(id) : null;
  useTitle((id ? "Editar" : "Nueva") + " categoría — Panel AuraArriendos");
  if (id && !existente) return <Navigate to="/admin/categorias" replace />;
  return <Formulario key={id || "nueva"} existente={existente} />;
}
