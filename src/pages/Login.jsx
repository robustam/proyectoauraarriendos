import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Reveal from "../components/Reveal";
import { FormAlert, FormField } from "../components/ui";
import * as store from "../services/store";
import useForm from "../hooks/useForm";
import useTitle from "../hooks/useTitle";
import safeNext from "../services/safeNext";
import * as V from "../services/validators";
import heroSearch from "../assets/hero-search.jpg";

/* Reglas: correo requerido máx. 100 con dominio permitido; contraseña 4-10 caracteres. */
export const loginRules = {
  correo: (v) => (V.requerido(v) && V.largoEntre(v, 1, 100) && V.esCorreoValido(v) ? null : "Correo inválido. Usa @duoc.cl, @profesor.duoc.cl o @gmail.com."),
  clave: (v) => (V.requerido(v) && V.largoEntre(v, 4, 10) ? null : "La contraseña debe tener entre 4 y 10 caracteres.")
};

export default function Login() {
  useTitle("Iniciar sesión — AuraArriendos");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const form = useForm({ correo: "", clave: "" }, loginRules);
  const [alert, setAlert] = useState(
    params.get("aviso") === "solicitudes"
      ? { type: "info", text: "Inicia sesión para guardar y enviar solicitudes de arriendo." }
      : null
  );

  const [enviando, setEnviando] = useState(false);

  /* El backend revisa el correo y la contraseña (encriptada con BCrypt) y
     devuelve los tokens JWT. Aquí solo se muestra el resultado. */
  async function onSubmit(e) {
    e.preventDefault();
    if (!form.validateAll()) return;
    setEnviando(true);
    try {
      const usuario = await store.iniciarSesion(form.values.correo, form.values.clave);
      navigate(store.esStaff(usuario) ? "/admin" : safeNext(params, "/"));
    } catch (error) {
      setAlert({ type: "error", text: error.estado === 401 ? "Correo o contraseña incorrectos." : error.message });
      setEnviando(false);
    }
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-6 d-none d-lg-block p-0">
          <div className="auth-visual">
            <img src={heroSearch} alt="" />
            <div className="auth-visual-content">
              <h2>Tu próximo hogar te está esperando.</h2>
              <p className="opacity-75" style={{ maxWidth: "34ch" }}>Accede para guardar propiedades, reservarlas y hacer seguimiento a tus solicitudes.</p>
            </div>
          </div>
        </div>
        <div className="col-lg-6 d-flex align-items-center py-5">
          <Reveal className="w-100 mx-auto px-2" style={{ maxWidth: 460 }}>
            <p className="eyebrow">Bienvenido de vuelta</p>
            <h1 className="mb-4">Inicia sesión</h1>
            <div className="auth-demo mb-4">
              <strong className="d-block mb-1">Cuentas de demostración</strong>
              admin@duoc.cl / admin123 (Administrador) · vendedor@gmail.com / vende123 (Vendedor) · cliente@gmail.com / cliente123 (Cliente)
            </div>
            <form onSubmit={onSubmit} noValidate aria-label="Iniciar sesión">
              <FormAlert alert={alert} />
              <div className="row g-3">
                <FormField label="Correo electrónico" htmlFor="l-correo" status={form.status.correo}>
                  <input type="email" className="form-control" {...form.bind("correo", "l-")} maxLength={100} autoComplete="email" placeholder="tucorreo@duoc.cl" />
                </FormField>
                <FormField label="Contraseña" htmlFor="l-clave" status={form.status.clave}>
                  <input type="password" className="form-control" {...form.bind("clave", "l-")} maxLength={10} autoComplete="current-password" placeholder="Entre 4 y 10 caracteres" />
                </FormField>
                <div className="col-12 d-grid">
                  <button type="submit" className="btn btn-primary" disabled={enviando}>{enviando ? "Ingresando…" : "Iniciar sesión"}</button>
                </div>
              </div>
            </form>
            <p className="mt-3 small text-mute">
              ¿No tienes cuenta? <Link className="fw-bold" to={"/registro" + (params.get("next") ? "?next=" + encodeURIComponent(params.get("next")) : "")}>Regístrate aquí</Link>
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
