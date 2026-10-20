import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { AdminHeader, FormAlert, FormField, ImagePicker } from "../../components/ui";
import * as store from "../../services/store";
import { useToast } from "../../context/ToastContext";
import useForm from "../../hooks/useForm";
import useTitle from "../../hooks/useTitle";
import { hoyISO } from "../../services/format";
import * as V from "../../services/validators";

/* Reglas: título req. máx. 100, resumen req. máx. 200, autor req. máx. 60,
   fecha requerida, contenido req. máx. 5000 (párrafos separados por una línea
   en blanco), imagen opcional. */
const IMAGEN_POR_DEFECTO = "/img/blog-1.jpg";

const RULES = {
  titulo: (v) => (V.requerido(v) && V.largoEntre(v, 1, 100) ? null : "Requerido, máximo 100 caracteres."),
  resumen: (v) => (V.requerido(v) && V.largoEntre(v, 1, 200) ? null : "Requerido, máximo 200 caracteres."),
  autor: (v) => (V.requerido(v) && V.largoEntre(v, 1, 60) ? null : "Requerido, máximo 60 caracteres."),
  fecha: (v) => (V.requerido(v) ? null : "Selecciona una fecha."),
  contenido: (v) => (V.requerido(v) && V.largoEntre(v, 1, 5000) ? null : "Escribe el artículo (máximo 5000 caracteres).")
};

function parrafos(texto) {
  return texto.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
}

function Formulario({ existente }) {
  const navigate = useNavigate();
  const toast = useToast();
  const editando = !!existente;
  const [alert, setAlert] = useState(null);

  const inicial = useMemo(() => (editando
    ? { titulo: existente.titulo, resumen: existente.resumen || "", autor: existente.autor || "", fecha: existente.fecha, contenido: (existente.contenido || []).join("\n\n"), imagen: existente.imagen || "" }
    : { titulo: "", resumen: "", autor: "Equipo AuraArriendos", fecha: hoyISO(), contenido: "", imagen: "" }),
  [editando, existente]);

  const form = useForm(inicial, RULES);
  const { values, status, bind } = form;

  function onSubmit(e) {
    e.preventDefault();
    if (!form.validateAll()) {
      setAlert({ type: "error", text: "Revisa los campos marcados en rojo." });
      return;
    }
    const post = {
      id: editando ? existente.id : store.nuevoIdPost(values.titulo),
      titulo: values.titulo.trim(),
      resumen: values.resumen.trim(),
      imagen: values.imagen || IMAGEN_POR_DEFECTO,
      fecha: values.fecha,
      autor: values.autor.trim(),
      contenido: parrafos(values.contenido)
    };
    if (!store.guardarPost(post)) {
      setAlert({ type: "error", text: "No se pudo guardar: el almacenamiento del navegador está lleno. Prueba con una imagen más liviana." });
      return;
    }
    toast(editando ? "Publicación actualizada" : "Publicación creada", "success");
    navigate("/admin/blog");
  }

  return (
    <>
      <AdminHeader eyebrow="Contenido del blog" title={editando ? "Editar publicación" : "Nueva publicación"}>
        <Link to="/admin/blog" className="btn btn-outline-secondary">← Volver al listado</Link>
      </AdminHeader>

      <form className="form-panel" style={{ maxWidth: 900 }} onSubmit={onSubmit} noValidate aria-label="Formulario del blog">
        <FormAlert alert={alert} />
        <div className="row g-3">
          <FormField label="Título" htmlFor="b-titulo" status={status.titulo} hint="Requerido, máximo 100 caracteres.">
            <input type="text" className="form-control" {...bind("titulo", "b-")} maxLength={100} placeholder="Ej: 5 consejos para elegir tu próximo arriendo" />
          </FormField>
          <FormField label="Resumen" htmlFor="b-resumen" status={status.resumen} hint={values.resumen.length + " / 200"}>
            <textarea className="form-control" rows={2} {...bind("resumen", "b-")} maxLength={200} placeholder="Una o dos frases que aparecerán en la tarjeta del blog" />
          </FormField>
          <FormField label="Autor" htmlFor="b-autor" status={status.autor} className="col-md-6">
            <input type="text" className="form-control" {...bind("autor", "b-")} maxLength={60} />
          </FormField>
          <FormField label="Fecha de publicación" htmlFor="b-fecha" status={status.fecha} className="col-md-6">
            <input type="date" className="form-control" {...bind("fecha", "b-")} />
          </FormField>
          <FormField label="Contenido del artículo" htmlFor="b-contenido" status={status.contenido} hint="Separa los párrafos con una línea en blanco. Máximo 5000 caracteres.">
            <textarea className="form-control" rows={10} {...bind("contenido", "b-")} maxLength={5000} placeholder="Escribe el artículo. Deja una línea en blanco para separar cada párrafo." />
          </FormField>
          <FormField label="Imagen de portada" htmlFor="b-imagen" hint="Opcional. Si no subes una, se usa una imagen por defecto.">
            <ImagePicker id="b-imagen" value={values.imagen} onChange={(img) => form.setSilently({ imagen: img })} />
          </FormField>
          <div className="col-12 d-grid">
            <button type="submit" className="btn btn-primary">Guardar publicación</button>
          </div>
        </div>
      </form>
    </>
  );
}

export default function BlogForm() {
  const { id } = useParams();
  const existente = id ? store.getPostPorId(id) : null;
  useTitle((id ? "Editar" : "Nueva") + " publicación — Panel AuraArriendos");
  if (id && !existente) return <Navigate to="/admin/blog" replace />;
  return <Formulario key={id || "nueva"} existente={existente} />;
}
