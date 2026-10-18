import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Reveal from "../components/Reveal";
import RegionComunaFields from "../components/RegionComunaFields";
import { FormAlert, FormField } from "../components/ui";
import * as store from "../services/store";
import { useToast } from "../context/ToastContext";
import useForm from "../hooks/useForm";
import useTitle from "../hooks/useTitle";
import safeNext from "../utils/safeNext";
import * as V from "../utils/validators";

/* Reglas: RUN válido (módulo 11, 7-9 caracteres sin puntos ni guion), nombre
   req. máx. 50, apellidos req. máx. 100, correo req. máx. 100 con dominio
   permitido y no registrado, fecha opcional, dirección req. máx. 300,
   contraseña 4-10 y confirmación igual. */
const INICIAL = { run: "", fecha: "", nombre: "", apellidos: "", correo: "", region: "", comuna: "", direccion: "", clave: "", claveConfirmar: "" };
const RULES = {
  run: (v) => {
    const limpio = V.limpiarRun(v);
    if (!(V.largoEntre(limpio, 7, 9) && V.esRunValido(limpio))) return "RUN inválido. Ingresa sin puntos ni guion, ej: 123456785.";
    return store.getUsuarioPorRun(limpio) ? "Ese RUN ya está registrado." : null;
  },
  nombre: (v) => (V.requerido(v) && V.largoEntre(v, 1, 50) && V.esNombrePersona(v) ? null : "Ingresa tu nombre usando solo letras (máximo 50 caracteres)."),
  apellidos: (v) => (V.requerido(v) && V.largoEntre(v, 1, 100) && V.esNombrePersona(v) ? null : "Ingresa tus apellidos usando solo letras (máximo 100 caracteres)."),
  correo: (v) => {
    if (!(V.requerido(v) && V.largoEntre(v, 1, 100) && V.esCorreoValido(v))) return "Correo inválido o con dominio no permitido (@duoc.cl, @profesor.duoc.cl, @gmail.com).";
    return store.getUsuarioPorCorreo(v) ? "Ese correo ya está registrado." : null;
  },
  region: (v) => (V.requerido(v) ? null : "Selecciona tu región."),
  comuna: (v) => (V.requerido(v) ? null : "Selecciona tu comuna."),
  direccion: (v) => (V.requerido(v) && V.largoEntre(v, 1, 300) ? null : "Ingresa tu dirección (máximo 300 caracteres)."),
  clave: (v) => (V.requerido(v) && V.largoEntre(v, 4, 10) ? null : "La contraseña debe tener entre 4 y 10 caracteres."),
  claveConfirmar: (v, all) => (V.requerido(v) && v === all.clave ? null : "Las contraseñas no coinciden.")
};

export default function Registro() {
  useTitle("Crear cuenta — AuraArriendos");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast = useToast();
  const form = useForm(INICIAL, RULES);
  const [alert, setAlert] = useState(null);
  const { values, status, bind } = form;

  function onSubmit(e) {
    e.preventDefault();
    if (!form.validateAll()) {
      setAlert({ type: "error", text: "Revisa los campos marcados en rojo." });
      return;
    }
    const nuevoUsuario = {
      run: V.limpiarRun(values.run),
      nombre: values.nombre.trim(),
      apellidos: values.apellidos.trim(),
      correo: values.correo.trim(),
      clave: values.clave,
      fechaNacimiento: values.fecha || null,
      tipoUsuario: "Cliente",
      region: values.region,
      comuna: values.comuna,
      direccion: values.direccion.trim()
    };
    store.guardarUsuario(nuevoUsuario);
    store.iniciarSesion(nuevoUsuario);
    toast("Cuenta creada. ¡Bienvenido/a a AuraArriendos!", "success");
    navigate(safeNext(params, "/"));
  }

  return (
    <section className="container section-tight">
      <Reveal className="form-panel mx-auto" style={{ maxWidth: 780 }}>
        <p className="eyebrow">Únete a AuraArriendos</p>
        <h1 className="mb-2">Crea tu cuenta</h1>
        <p className="lede mb-4">Regístrate para guardar propiedades, reservarlas y publicar tu propia propiedad.</p>

        <form onSubmit={onSubmit} noValidate aria-label="Crear cuenta">
          <FormAlert alert={alert} />
          <div className="row g-3">
            <FormField label="RUN" htmlFor="r-run" status={status.run} className="col-md-6" hint="Sin puntos ni guion. Entre 7 y 9 caracteres.">
              <input type="text" className="form-control" {...bind("run", "r-")} maxLength={12} placeholder="123456785" autoComplete="off" />
            </FormField>
            <FormField label="Fecha de nacimiento (opcional)" htmlFor="r-fecha" className="col-md-6">
              <input type="date" className="form-control" {...bind("fecha", "r-")} autoComplete="bday" />
            </FormField>
            <FormField label="Nombre" htmlFor="r-nombre" status={status.nombre} className="col-md-6">
              <input type="text" className="form-control" {...bind("nombre", "r-")} maxLength={50} autoComplete="given-name" placeholder="Ej: Camila" />
            </FormField>
            <FormField label="Apellidos" htmlFor="r-apellidos" status={status.apellidos} className="col-md-6">
              <input type="text" className="form-control" {...bind("apellidos", "r-")} maxLength={100} autoComplete="family-name" placeholder="Ej: Rivas Soto" />
            </FormField>
            <FormField label="Correo electrónico" htmlFor="r-correo" status={status.correo} hint="Solo @duoc.cl, @profesor.duoc.cl o @gmail.com.">
              <input type="email" className="form-control" {...bind("correo", "r-")} maxLength={100} autoComplete="email" placeholder="tucorreo@duoc.cl" />
            </FormField>
            <RegionComunaFields form={form} prefix="r-" />
            <FormField label="Dirección" htmlFor="r-direccion" status={status.direccion}>
              <input type="text" className="form-control" {...bind("direccion", "r-")} maxLength={300} autoComplete="street-address" placeholder="Calle, número, depto (si aplica)" />
            </FormField>
            <FormField label="Contraseña" htmlFor="r-clave" status={status.clave} className="col-md-6">
              <input
                type="password" className="form-control" id="r-clave" value={values.clave} maxLength={10} autoComplete="new-password" placeholder="4 a 10 caracteres"
                onChange={(e) => form.setField("clave", e.target.value, values.claveConfirmar ? ["claveConfirmar"] : [])}
              />
            </FormField>
            <FormField label="Confirmar contraseña" htmlFor="r-claveConfirmar" status={status.claveConfirmar} className="col-md-6">
              <input type="password" className="form-control" {...bind("claveConfirmar", "r-")} maxLength={10} autoComplete="new-password" placeholder="Repite tu contraseña" />
            </FormField>
            <div className="col-12 d-grid">
              <button type="submit" className="btn btn-primary">Registrar</button>
            </div>
          </div>
        </form>
        <p className="mt-3 small text-mute">¿Ya tienes cuenta? <Link className="fw-bold" to="/login">Inicia sesión</Link></p>
      </Reveal>
    </section>
  );
}
