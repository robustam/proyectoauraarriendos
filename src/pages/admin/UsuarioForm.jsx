import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import RegionComunaFields from "../../components/RegionComunaFields";
import { AdminHeader, FormAlert, FormField } from "../../components/ui";
import * as store from "../../services/store";
import { useToast } from "../../context/ToastContext";
import useForm from "../../hooks/useForm";
import useTitle from "../../hooks/useTitle";
import * as V from "../../utils/validators";

/* Alta y edición de usuarios: mismas reglas que el registro público más el
   tipo de usuario (Administrador / Agente / Cliente). */
function Formulario({ existente, correoOriginal }) {
  const navigate = useNavigate();
  const toast = useToast();
  const editando = !!existente;
  const [alert, setAlert] = useState(null);

  const inicial = useMemo(() => (editando
    ? {
        run: existente.run, fecha: existente.fechaNacimiento || "", nombre: existente.nombre, apellidos: existente.apellidos,
        correo: existente.correo, tipo: existente.tipoUsuario, region: existente.region || "", comuna: existente.comuna || "",
        direccion: existente.direccion || "", clave: ""
      }
    : { run: "", fecha: "", nombre: "", apellidos: "", correo: "", tipo: "Cliente", region: "", comuna: "", direccion: "", clave: "" }),
  [editando, existente]);

  const rules = useMemo(() => ({
    run: (v) => {
      if (editando) return null;
      const limpio = V.limpiarRun(v);
      if (!(V.largoEntre(limpio, 7, 9) && V.esRunValido(limpio))) return "RUN inválido. Sin puntos ni guion, ej: 123456785.";
      return store.getUsuarioPorRun(limpio) ? "Ese RUN ya está registrado." : null;
    },
    nombre: (v) => (V.requerido(v) && V.largoEntre(v, 1, 50) && V.esNombrePersona(v) ? null : "Solo letras, máximo 50 caracteres."),
    apellidos: (v) => (V.requerido(v) && V.largoEntre(v, 1, 100) && V.esNombrePersona(v) ? null : "Solo letras, máximo 100 caracteres."),
    correo: (v) => {
      if (!(V.requerido(v) && V.largoEntre(v, 1, 100) && V.esCorreoValido(v))) return "Correo inválido o con dominio no permitido.";
      const otro = store.getUsuarioPorCorreo(v);
      if (otro && !(editando && otro.correo.toLowerCase() === correoOriginal.toLowerCase())) return "Ese correo ya lo usa otro usuario.";
      return null;
    },
    tipo: (v) => (V.requerido(v) ? null : "Selecciona un tipo de usuario."),
    region: (v) => (V.requerido(v) ? null : "Selecciona una región."),
    comuna: (v) => (V.requerido(v) ? null : "Selecciona una comuna."),
    direccion: (v) => (V.requerido(v) && V.largoEntre(v, 1, 300) ? null : "Máximo 300 caracteres."),
    clave: (v) => {
      if (editando && !v) return null;
      return V.requerido(v) && V.largoEntre(v, 4, 10) ? null : "Entre 4 y 10 caracteres.";
    }
  }), [editando, correoOriginal]);

  const form = useForm(inicial, rules);
  const { values, status, bind } = form;

  function onSubmit(e) {
    e.preventDefault();
    if (!form.validateAll()) {
      setAlert({ type: "error", text: "Revisa los campos marcados en rojo." });
      return;
    }
    const usuario = store.guardarUsuario({
      run: editando ? existente.run : V.limpiarRun(values.run),
      nombre: values.nombre.trim(),
      apellidos: values.apellidos.trim(),
      correo: values.correo.trim(),
      clave: values.clave ? values.clave : existente.clave,
      fechaNacimiento: values.fecha || null,
      tipoUsuario: values.tipo,
      region: values.region,
      comuna: values.comuna,
      direccion: values.direccion.trim()
    }, correoOriginal);
    /* Si el administrador edita su propia cuenta, se actualiza la sesión. */
    const sesion = store.getSesion();
    if (editando && sesion && sesion.correo.toLowerCase() === correoOriginal.toLowerCase()) store.iniciarSesion(usuario);
    toast(editando ? "Usuario actualizado" : "Usuario creado", "success");
    navigate("/admin/usuarios");
  }

  return (
    <>
      <AdminHeader eyebrow="Gestión de usuarios" title={editando ? "Editar usuario" : "Nuevo usuario"}>
        <Link to="/admin/usuarios" className="btn btn-outline-secondary">← Volver al listado</Link>
      </AdminHeader>

      <form className="form-panel" style={{ maxWidth: 820 }} onSubmit={onSubmit} noValidate aria-label="Formulario de usuario">
        <FormAlert alert={alert} />
        <div className="row g-3">
          <FormField label="RUN" htmlFor="u-run" status={status.run} className="col-md-6" hint={editando ? "El RUN no se puede modificar." : "Sin puntos ni guion. Entre 7 y 9 caracteres."}>
            <input type="text" className="form-control" {...bind("run", "u-")} maxLength={12} placeholder="123456785" disabled={editando} />
          </FormField>
          <FormField label="Fecha de nacimiento (opcional)" htmlFor="u-fecha" className="col-md-6">
            <input type="date" className="form-control" {...bind("fecha", "u-")} />
          </FormField>
          <FormField label="Nombre" htmlFor="u-nombre" status={status.nombre} className="col-md-6">
            <input type="text" className="form-control" {...bind("nombre", "u-")} maxLength={50} />
          </FormField>
          <FormField label="Apellidos" htmlFor="u-apellidos" status={status.apellidos} className="col-md-6">
            <input type="text" className="form-control" {...bind("apellidos", "u-")} maxLength={100} />
          </FormField>
          <FormField label="Correo electrónico" htmlFor="u-correo" status={status.correo} className="col-md-6">
            <input type="email" className="form-control" {...bind("correo", "u-")} maxLength={100} />
          </FormField>
          <FormField label="Tipo de usuario" htmlFor="u-tipo" status={status.tipo} className="col-md-6">
            <select className="form-select" {...bind("tipo", "u-")}>
              <option value="Cliente">Cliente</option>
              <option value="Agente">Agente (aprueba solicitudes y coordina trámites)</option>
              <option value="Administrador">Administrador</option>
            </select>
          </FormField>
          <RegionComunaFields form={form} prefix="u-" />
          <FormField label="Dirección" htmlFor="u-direccion" status={status.direccion}>
            <input type="text" className="form-control" {...bind("direccion", "u-")} maxLength={300} />
          </FormField>
          <FormField label="Contraseña" htmlFor="u-clave" status={status.clave}>
            <input
              type="password" className="form-control" {...bind("clave", "u-")} maxLength={10} autoComplete="new-password"
              placeholder={editando ? "Dejar en blanco para mantener la actual" : "Entre 4 y 10 caracteres"}
            />
          </FormField>
          <div className="col-12 d-grid">
            <button type="submit" className="btn btn-primary">Guardar usuario</button>
          </div>
        </div>
      </form>
    </>
  );
}

export default function UsuarioForm() {
  const { correo } = useParams();
  const existente = correo ? store.getUsuarioPorCorreo(correo) : null;
  useTitle((correo ? "Editar" : "Nuevo") + " usuario — Panel AuraArriendos");
  if (correo && !existente) return <Navigate to="/admin/usuarios" replace />;
  return <Formulario key={correo || "nuevo"} existente={existente} correoOriginal={correo || null} />;
}
