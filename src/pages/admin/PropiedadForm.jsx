import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useOutletContext, useParams } from "react-router-dom";
import PropiedadCampos, { PROPIEDAD_VACIA, camposNumericos, propiedadRules } from "../../components/PropiedadCampos";
import { AdminHeader, FormAlert, FormField } from "../../components/ui";
import * as store from "../../services/store";
import { useToast } from "../../context/ToastContext";
import useForm from "../../hooks/useForm";
import useTitle from "../../hooks/useTitle";
import * as V from "../../utils/validators";
import { getImagenes } from "../../utils/format";

/* Alta y edición de propiedades (solo Administrador). Además de las reglas
   comunes: código req. mín. 3 sin máximo y único. */
function valoresDesde(p) {
  return {
    codigo: p.codigo,
    categoria: p.categoria,
    nombre: p.nombre,
    descripcion: p.descripcion || "",
    region: p.region,
    comuna: p.comuna,
    direccion: p.direccion,
    precio: String(p.precio),
    precioOferta: p.precioOferta != null ? String(p.precioOferta) : "",
    m2: String(p.m2),
    dormitorios: String(p.dormitorios ?? 0),
    banos: String(p.banos ?? 0),
    unidades: String(p.unidadesDisponibles ?? 0),
    alerta: p.alertaDisponibilidad != null ? String(p.alertaDisponibilidad) : "",
    estacionamiento: !!p.estacionamiento,
    estado: p.estado,
    destacada: !!p.destacada,
    arrendada: !!p.arrendada,
    imagen: ""
  };
}

function Formulario({ existente, sesion }) {
  const navigate = useNavigate();
  const toast = useToast();
  const editando = !!existente;
  const [alert, setAlert] = useState(null);

  const inicial = useMemo(
    () => (editando
      ? valoresDesde(existente)
      : { ...PROPIEDAD_VACIA, codigo: store.nuevoIdPropiedad(), unidades: "", estado: "publicada", destacada: false, arrendada: false }),
    [editando, existente]
  );

  const rules = useMemo(() => ({
    codigo: (v) => {
      if (!(V.requerido(v) && V.largoEntre(v, 3, null))) return "Mínimo 3 caracteres.";
      const repetido = store.getPropiedades().some((p) =>
        String(p.codigo).toLowerCase() === v.trim().toLowerCase() && (!editando || p.id !== existente.id));
      return repetido ? "Ese código ya lo usa otra propiedad." : null;
    },
    ...propiedadRules,
    categoria: (v) => (V.requerido(v) ? null : "Selecciona una categoría.")
  }), [editando, existente]);

  const form = useForm(inicial, rules);
  const v = form.values;
  const imagenesActuales = editando ? getImagenes(existente) : [];

  function onSubmit(e) {
    e.preventDefault();
    if (!form.validateAll()) {
      setAlert({ type: "error", text: "Revisa los campos marcados en rojo." });
      return;
    }
    /* Si no se sube imagen nueva, se conserva la galería existente. */
    const imagenes = v.imagen ? [v.imagen] : imagenesActuales.length ? imagenesActuales : ["/img/prop-1.jpg"];
    const propiedad = {
      ...(editando ? existente : {}),
      id: editando ? existente.id : store.nuevoIdPropiedad(),
      codigo: v.codigo.trim(),
      nombre: v.nombre.trim(),
      categoria: v.categoria,
      region: v.region,
      comuna: v.comuna,
      direccion: v.direccion.trim(),
      ...camposNumericos(v),
      estacionamiento: !!v.estacionamiento,
      imagen: imagenes[0],
      imagenes,
      descripcion: v.descripcion.trim(),
      estado: v.estado,
      destacada: !!v.destacada,
      arrendada: !!v.arrendada,
      publicadoPor: editando ? existente.publicadoPor : sesion.correo
    };
    if (propiedad.arrendada) propiedad.fechaArrendada = (editando && existente.fechaArrendada) || new Date().toISOString();
    else delete propiedad.fechaArrendada;
    if (propiedad.estado !== "rechazada") delete propiedad.motivoRechazo;

    store.guardarPropiedad(propiedad);
    toast(editando ? "Propiedad actualizada" : "Propiedad creada", "success");
    navigate(editando ? "/admin/propiedades/" + encodeURIComponent(propiedad.id) : "/admin/propiedades");
  }

  const check = (name, label) => (
    <div className="form-check form-check-inline">
      <input className="form-check-input" type="checkbox" id={"a-" + name} checked={!!v[name]} onChange={(e) => form.setSilently({ [name]: e.target.checked })} />
      <label className="form-check-label" htmlFor={"a-" + name}>{label}</label>
    </div>
  );

  return (
    <>
      <AdminHeader eyebrow="Gestión de propiedades" title={editando ? "Editar propiedad" : "Nueva propiedad"}>
        <Link to="/admin/propiedades" className="btn btn-outline-secondary">← Volver al listado</Link>
      </AdminHeader>

      <form className="form-panel" style={{ maxWidth: 920 }} onSubmit={onSubmit} noValidate aria-label="Formulario de propiedad">
        <FormAlert alert={alert} />
        <div className="row g-3">
          <FormField label="Código interno" htmlFor="a-codigo" status={form.status.codigo} className="col-md-6" hint="Sugerido automáticamente; puedes cambiarlo. Mínimo 3 caracteres.">
            <input type="text" className="form-control" {...form.bind("codigo", "a-")} />
          </FormField>
          <FormField label="Estado" htmlFor="a-estado" className="col-md-6">
            <select className="form-select" {...form.bind("estado", "a-")}>
              <option value="publicada">Publicada</option>
              <option value="pendiente">Pendiente</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </FormField>

          <PropiedadCampos form={form} prefix="a-" admin>
            <div className="col-12">
              {check("estacionamiento", "Incluye estacionamiento")}
              {check("destacada", "Destacar en la página principal")}
              {check("arrendada", "Arrendada (ocultar del sitio)")}
            </div>
          </PropiedadCampos>

          {editando && !v.imagen && imagenesActuales.length > 0 && (
            <div className="col-12">
              <div className="image-preview">
                {imagenesActuales.map((src, i) => <img key={src + i} src={src} alt={"Foto actual " + (i + 1)} />)}
              </div>
              <div className="form-text">Fotos actuales. Si subes una imagen nueva, reemplazará la galería.</div>
            </div>
          )}

          <div className="col-12 d-grid">
            <button type="submit" className="btn btn-primary">Guardar propiedad</button>
          </div>
        </div>
      </form>
    </>
  );
}

export default function PropiedadForm() {
  const { id } = useParams();
  const { sesion } = useOutletContext();
  const existente = id ? store.getPropiedadPorId(id) : null;
  useTitle((id ? "Editar" : "Nueva") + " propiedad — Panel AuraArriendos");

  if (id && !existente) return <Navigate to="/admin/propiedades" replace />;
  /* key: reinicia el formulario si se cambia de propiedad sin desmontar. */
  return <Formulario key={id || "nueva"} existente={existente} sesion={sesion} />;
}
