import { useState } from "react";
import Reveal from "../components/Reveal";
import { FormAlert, FormField } from "../components/ui";
import { BRAND } from "../services/manifest";
import * as store from "../services/store";
import { useToast } from "../context/ToastContext";
import useForm from "../hooks/useForm";
import useTitle from "../hooks/useTitle";
import * as V from "../services/validators";
import contactBg from "../assets/contact-bg.jpg";

/* Reglas: nombre requerido máx. 100; correo máx. 100 con dominio permitido;
   comentario requerido máx. 500. El mensaje llega al Inbox del administrador. */
const INICIAL = { nombre: "", correo: "", comentario: "" };
export const contactoRules = {
  nombre: (v) => (V.requerido(v) && V.largoEntre(v, 1, 100) ? null : "Ingresa tu nombre completo (máximo 100 caracteres)."),
  correo: (v) => (V.requerido(v) && V.largoEntre(v, 1, 100) && V.esCorreoValido(v) ? null : "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com (máximo 100 caracteres)."),
  comentario: (v) => (V.requerido(v) && V.largoEntre(v, 1, 500) ? null : "Cuéntanos tu mensaje (máximo 500 caracteres).")
};

const INFO = [
  { glyph: "✉️", titulo: "Correo", texto: BRAND.email },
  { glyph: "📞", titulo: "Teléfono", texto: BRAND.phone },
  { glyph: "📍", titulo: "Oficina", texto: "Av. Apoquindo 3000, of. 501, Las Condes" },
  { glyph: "🕑", titulo: "Horario", texto: "Lunes a viernes, 9:00–18:30" }
];

export default function Contacto() {
  useTitle("Contacto — AuraArriendos");
  const toast = useToast();
  const form = useForm(INICIAL, contactoRules);
  const [alert, setAlert] = useState(null);

  function onSubmit(e) {
    e.preventDefault();
    if (!form.validateAll()) {
      setAlert({ type: "error", text: "Revisa los campos marcados en rojo antes de enviar." });
      return;
    }
    store.guardarMensaje({
      nombre: form.values.nombre.trim(),
      correo: form.values.correo.trim(),
      comentario: form.values.comentario.trim()
    });
    form.reset(INICIAL);
    setAlert({ type: "success", text: "¡Gracias! Recibimos tu mensaje y te responderemos dentro de las próximas 24 horas." });
    toast("Mensaje enviado correctamente", "success");
  }

  return (
    <>
      <Reveal as="section" className="page-hero container">
        <div className="page-hero-bg"><img src={contactBg} alt="" /></div>
        <p className="eyebrow">Hablemos</p>
        <h1>¿En qué te podemos ayudar?</h1>
        <p className="lede">Ya sea que busques arriendo, quieras publicar tu propiedad o tengas dudas sobre tu cuenta, escríbenos.</p>
      </Reveal>

      <section className="container section-tight pt-0">
        <div className="row g-4 g-lg-5">
          <Reveal className="col-lg-5 d-grid gap-3 align-content-start">
            {INFO.map((i) => (
              <div className="d-flex gap-3 align-items-start" key={i.titulo}>
                <div className="icon-tile">{i.glyph}</div>
                <div><strong className="d-block">{i.titulo}</strong><span className="text-mute small">{i.texto}</span></div>
              </div>
            ))}
          </Reveal>

          <Reveal className="col-lg-7">
            <form className="form-panel" onSubmit={onSubmit} noValidate aria-label="Formulario de contacto">
              <FormAlert alert={alert} />
              <div className="row g-3">
                <FormField label="Nombre completo" htmlFor="c-nombre" status={form.status.nombre} className="col-md-6">
                  <input type="text" className="form-control" {...form.bind("nombre", "c-")} maxLength={100} autoComplete="name" placeholder="Ej: María Pérez" />
                </FormField>
                <FormField label="Correo electrónico" htmlFor="c-correo" status={form.status.correo} className="col-md-6" hint="Aceptamos @duoc.cl, @profesor.duoc.cl o @gmail.com.">
                  <input type="email" className="form-control" {...form.bind("correo", "c-")} maxLength={100} autoComplete="email" placeholder="tucorreo@duoc.cl" />
                </FormField>
                <FormField label="Mensaje" htmlFor="c-comentario" status={form.status.comentario} hint={form.values.comentario.length + " / 500"}>
                  <textarea className="form-control" rows={5} {...form.bind("comentario", "c-")} maxLength={500} placeholder="Cuéntanos en qué te podemos ayudar" />
                </FormField>
                <div className="col-12 d-grid">
                  <button type="submit" className="btn btn-primary">Enviar mensaje</button>
                </div>
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
