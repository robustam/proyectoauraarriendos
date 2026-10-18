import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import RegionComunaFields from "../../components/RegionComunaFields";
import { AdminHeader, FormAlert, FormField } from "../../components/ui";
import * as store from "../../services/store";
import { useToast } from "../../context/ToastContext";
import useForm from "../../hooks/useForm";
import useTitle from "../../hooks/useTitle";
import * as V from "../../utils/validators";

/* "Perfil": el usuario del panel edita sus propios datos y su contraseña.
   El correo, el RUN y el rol no se cambian desde aquí. */
export default function Perfil() {
  useTitle("Mi perfil — Panel AuraArriendos");
  const { sesion } = useOutletContext();
  const toast = useToast();
  const usuario = store.getUsuarioPorCorreo(sesion.correo);
  const [alert, setAlert] = useState(null);

  const inicial = useMemo(() => ({
    nombre: usuario?.nombre || "", apellidos: usuario?.apellidos || "", direccion: usuario?.direccion || "",
    region: usuario?.region || "", comuna: usuario?.comuna || "", clave: "", claveConfirmar: ""
  }), [usuario?.correo]);

  const form = useForm(inicial, {
    nombre: (v) => (V.requerido(v) && V.largoEntre(v, 1, 50) && V.esNombrePersona(v) ? null : "Solo letras, máximo 50 caracteres."),
    apellidos: (v) => (V.requerido(v) && V.largoEntre(v, 1, 100) && V.esNombrePersona(v) ? null : "Solo letras, máximo 100 caracteres."),
    direccion: (v) => (V.requerido(v) && V.largoEntre(v, 1, 300) ? null : "Máximo 300 caracteres."),
    region: (v) => (V.requerido(v) ? null : "Selecciona una región."),
    comuna: (v) => (V.requerido(v) ? null : "Selecciona una comuna."),
    clave: (v) => (!v || V.largoEntre(v, 4, 10) ? null : "Entre 4 y 10 caracteres."),
    claveConfirmar: (v, all) => (v === all.clave ? null : "Las contraseñas no coinciden.")
  });
  const { values, status, bind } = form;

  if (!usuario) return <p>No encontramos tu cuenta.</p>;

  function onSubmit(e) {
    e.preventDefault();
    if (!form.validateAll()) {
      setAlert({ type: "error", text: "Revisa los campos marcados en rojo." });
      return;
    }
    const actualizado = {
      ...usuario,
      nombre: values.nombre.trim(),
      apellidos: values.apellidos.trim(),
      direccion: values.direccion.trim(),
      region: values.region,
      comuna: values.comuna,
      clave: values.clave || usuario.clave
    };
    store.guardarUsuario(actualizado, usuario.correo);
    store.iniciarSesion(actualizado);
    form.setSilently({ clave: "", claveConfirmar: "" });
    setAlert({ type: "success", text: "Tus datos fueron actualizados." });
    toast("Perfil actualizado", "success");
  }

  return (
    <>
      <AdminHeader eyebrow={sesion.tipoUsuario} title="Mi perfil" />
      <div className="row g-4">
        <div className="col-xl-4">
          <div className="card p-4 text-center">
            <div className="admin-avatar mx-auto mb-2" style={{ width: 72, height: 72, fontSize: "1.6rem" }}>{usuario.nombre.charAt(0)}</div>
            <strong className="d-block">{usuario.nombre} {usuario.apellidos}</strong>
            <span className="small text-mute d-block">{usuario.correo}</span>
            <span className="chip mx-auto mt-2">{usuario.tipoUsuario}</span>
            <p className="small text-mute mt-3 mb-0">RUN {usuario.run}</p>
          </div>
        </div>
        <div className="col-xl-8">
          <form className="form-panel" onSubmit={onSubmit} noValidate aria-label="Editar perfil">
            <FormAlert alert={alert} />
            <div className="row g-3">
              <FormField label="Nombre" htmlFor="pf-nombre" status={status.nombre} className="col-md-6">
                <input className="form-control" {...bind("nombre", "pf-")} maxLength={50} />
              </FormField>
              <FormField label="Apellidos" htmlFor="pf-apellidos" status={status.apellidos} className="col-md-6">
                <input className="form-control" {...bind("apellidos", "pf-")} maxLength={100} />
              </FormField>
              <RegionComunaFields form={form} prefix="pf-" />
              <FormField label="Dirección" htmlFor="pf-direccion" status={status.direccion}>
                <input className="form-control" {...bind("direccion", "pf-")} maxLength={300} />
              </FormField>
              <FormField label="Nueva contraseña (opcional)" htmlFor="pf-clave" status={status.clave} className="col-md-6">
                <input type="password" className="form-control" {...bind("clave", "pf-")} maxLength={10} autoComplete="new-password" placeholder="Dejar en blanco para mantenerla" />
              </FormField>
              <FormField label="Confirmar contraseña" htmlFor="pf-claveConfirmar" status={status.claveConfirmar} className="col-md-6">
                <input type="password" className="form-control" {...bind("claveConfirmar", "pf-")} maxLength={10} autoComplete="new-password" />
              </FormField>
              <div className="col-12 d-grid">
                <button type="submit" className="btn btn-primary">Guardar cambios</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
