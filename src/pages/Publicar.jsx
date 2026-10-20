import { useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import PropiedadCampos, { PROPIEDAD_VACIA, camposNumericos, propiedadRules } from "../components/PropiedadCampos";
import { FormAlert, StatusPill } from "../components/ui";
import * as store from "../services/store";
import { useToast } from "../context/ToastContext";
import { useSession, useStoreVersion } from "../hooks/useStore";
import useForm from "../hooks/useForm";
import useTitle from "../hooks/useTitle";
import { formatPrice, getMainImage } from "../services/format";

/* Un usuario con sesión publica su propiedad; queda "pendiente" hasta que un
   Administrador o Agente la aprueba o rechaza en el panel. */
function MisPublicaciones({ correo }) {
  useStoreVersion();
  const toast = useToast();
  const mias = store.getPropiedades().filter((p) => p.publicadoPor === correo);

  function toggleArrendada(p) {
    const nuevo = !p.arrendada;
    store.marcarArrendada(p.id, nuevo);
    toast(nuevo ? "Marcada como arrendada: ya no se muestra en el sitio" : "Tu propiedad vuelve a estar visible", "success");
  }

  if (!mias.length) return <p className="text-mute small mb-0">Aún no has publicado ninguna propiedad.</p>;

  return (
    <ul className="list-group list-group-flush">
      {mias.map((p) => {
        const estado = p.arrendada ? "arrendada" : p.estado;
        return (
          <li key={p.id} className="list-group-item px-0 d-flex gap-3 align-items-start">
            <img src={getMainImage(p)} alt={p.nombre} className="thumb-sm" />
            <div className="flex-grow-1 small">
              <strong className="d-block">{p.nombre}</strong>
              <span className="text-mute">{p.comuna} · {formatPrice(p.precio)} / mes</span>
              <div className="mt-1"><StatusPill estado={estado} /></div>
              {p.estado === "rechazada" && p.motivoRechazo && <div className="text-danger mt-1">Motivo: {p.motivoRechazo}</div>}
              {p.estado === "publicada" && (
                <button type="button" className="btn btn-outline-secondary btn-sm mt-2" onClick={() => toggleArrendada(p)}>
                  {p.arrendada ? "Volver a publicar" : "Marcar como arrendada"}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function Publicar() {
  useTitle("Publicar mi arriendo — AuraArriendos");
  const sesion = useSession();
  const toast = useToast();
  const form = useForm(PROPIEDAD_VACIA, propiedadRules);
  const [alert, setAlert] = useState(null);

  function onSubmit(e) {
    e.preventDefault();
    if (!form.validateAll()) {
      setAlert({ type: "error", text: "Revisa los campos marcados en rojo." });
      return;
    }
    const v = form.values;
    const id = store.nuevoIdPropiedad();
    const imagen = v.imagen || "/img/prop-1.jpg";
    store.guardarPropiedad({
      id,
      codigo: id,
      nombre: v.nombre.trim(),
      categoria: v.categoria,
      region: v.region,
      comuna: v.comuna,
      direccion: v.direccion.trim(),
      ...camposNumericos(v),
      estacionamiento: !!v.estacionamiento,
      imagen,
      imagenes: [imagen],
      descripcion: v.descripcion.trim(),
      estado: "pendiente",
      destacada: false,
      publicadoPor: sesion.correo
    });
    form.reset(PROPIEDAD_VACIA);
    setAlert({ type: "success", text: "¡Listo! Tu propiedad fue enviada a revisión. Te avisaremos cuando sea aprobada." });
    toast("Publicación enviada a revisión", "success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <Reveal as="section" className="page-hero container">
        <p className="eyebrow">Para arrendadores</p>
        <h1>Publica tu propiedad en arriendo</h1>
        <p className="lede">Completa la ficha con el mayor detalle posible. Nuestro equipo revisa cada publicación antes de que quede visible para el público.</p>
      </Reveal>

      <section className="container section-tight pt-0">
        {!sesion ? (
          <div className="form-panel mx-auto text-center" style={{ maxWidth: 640 }}>
            <p className="eyebrow">Necesitas una cuenta</p>
            <h2 className="mb-2">Inicia sesión para publicar</h2>
            <p className="lede mx-auto mb-4">Crea tu cuenta o inicia sesión para poder publicar y hacer seguimiento a tus propiedades.</p>
            <div className="d-flex justify-content-center gap-2">
              <Link to="/login?next=%2Fpublicar" className="btn btn-primary">Iniciar sesión</Link>
              <Link to="/registro?next=%2Fpublicar" className="btn btn-outline-secondary">Crear cuenta</Link>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-lg-8">
              <form className="form-panel" onSubmit={onSubmit} noValidate aria-label="Publicar propiedad">
                <FormAlert alert={alert} />
                <div className="row g-3">
                  <PropiedadCampos form={form} prefix="p-">
                    <div className="col-12">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="p-estacionamiento" checked={form.values.estacionamiento} onChange={(e) => form.setSilently({ estacionamiento: e.target.checked })} />
                        <label className="form-check-label" htmlFor="p-estacionamiento">Incluye estacionamiento</label>
                      </div>
                    </div>
                  </PropiedadCampos>
                  <div className="col-12 d-grid">
                    <button type="submit" className="btn btn-primary">Enviar a revisión</button>
                  </div>
                </div>
              </form>
            </div>
            <div className="col-lg-4">
              <aside className="card p-4">
                <h2 className="h5 mb-1">Mis publicaciones</h2>
                <p className="form-text mb-3">Aquí verás el estado de tus propiedades enviadas.</p>
                <MisPublicaciones correo={sesion.correo} />
              </aside>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
