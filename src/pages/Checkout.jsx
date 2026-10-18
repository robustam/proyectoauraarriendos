import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import RegionComunaFields from "../components/RegionComunaFields";
import { EmptyState, FormAlert, FormField } from "../components/ui";
import * as store from "../services/store";
import pagos, { TARJETAS_PRUEBA } from "../services/pagos";
import { useToast } from "../context/ToastContext";
import { useSession } from "../hooks/useStore";
import useForm from "../hooks/useForm";
import useTitle from "../hooks/useTitle";
import { disponibleParaReservar, formatPrice, getMainImage, hoyISO, precioFinal } from "../utils/format";
import * as V from "../utils/validators";

/* Checkout (paso de pago): el cliente confirma sus datos y su domicilio,
   elige la fecha de inicio del arriendo y paga la reserva (primer mes) con
   tarjeta. Si inició sesión, sus datos se completan solos.
   El pago se procesa con services/pagos.js (simulado) y se crea una orden
   "pagada" o "rechazada"; luego se navega a la vista de resultado. */
export const checkoutRules = {
  nombre: (v) => (V.requerido(v) && V.largoEntre(v, 1, 50) && V.esNombrePersona(v) ? null : "Ingresa tu nombre (solo letras, máx. 50)."),
  apellidos: (v) => (V.requerido(v) && V.largoEntre(v, 1, 100) && V.esNombrePersona(v) ? null : "Ingresa tus apellidos (solo letras, máx. 100)."),
  correo: (v) => (V.requerido(v) && V.esCorreoValido(v) ? null : "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com."),
  calle: (v) => (V.requerido(v) && V.largoEntre(v, 1, 300) ? null : "Ingresa calle y número (máx. 300)."),
  departamento: (v) => (V.largoEntre(v, 0, 50) ? null : "Máximo 50 caracteres."),
  region: (v) => (V.requerido(v) ? null : "Selecciona una región."),
  comuna: (v) => (V.requerido(v) ? null : "Selecciona una comuna."),
  indicaciones: (v) => (V.largoEntre(v, 0, 300) ? null : "Máximo 300 caracteres."),
  fechaInicio: (v) => (V.requerido(v) && v >= hoyISO() ? null : "Elige una fecha de hoy en adelante."),
  titular: (v) => (V.requerido(v) && V.largoEntre(v, 1, 100) ? null : "Ingresa el nombre del titular."),
  tarjeta: (v) => (V.esTarjetaValida(v) ? null : "Número de tarjeta inválido."),
  vencimiento: (v) => (V.esVencimientoValido(v) ? null : "Usa el formato MM/AA con una fecha futura."),
  cvv: (v) => (V.esCvvValido(v) ? null : "El CVV tiene 3 o 4 dígitos.")
};

function valoresIniciales(sesion, ordenPrevia) {
  if (ordenPrevia) {
    return {
      ...ordenPrevia.cliente, ...ordenPrevia.direccion, fechaInicio: ordenPrevia.fechaInicio || "",
      titular: ordenPrevia.cliente.nombre + " " + ordenPrevia.cliente.apellidos, tarjeta: "", vencimiento: "", cvv: ""
    };
  }
  const u = sesion ? store.getUsuarioPorCorreo(sesion.correo) : null;
  return {
    nombre: u ? u.nombre : "", apellidos: u ? u.apellidos : "", correo: u ? u.correo : "",
    calle: u ? u.direccion || "" : "", departamento: "", region: u ? u.region || "" : "", comuna: u ? u.comuna || "" : "",
    indicaciones: "", fechaInicio: "", titular: u ? u.nombre + " " + u.apellidos : "", tarjeta: "", vencimiento: "", cvv: ""
  };
}

function Formulario({ sesion, items, ordenPrevia }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [alert, setAlert] = useState(
    ordenPrevia ? { type: "info", text: "Revisa los datos de tu tarjeta e inténtalo nuevamente." } : null
  );
  const inicial = useMemo(() => valoresIniciales(sesion, ordenPrevia), [sesion, ordenPrevia]);
  const form = useForm(inicial, checkoutRules);
  const { values: v, status, bind } = form;
  const total = items.reduce((acc, p) => acc + precioFinal(p), 0);

  function onSubmit(e) {
    e.preventDefault();
    if (!form.validateAll()) {
      setAlert({ type: "error", text: "Revisa los campos marcados en rojo." });
      return;
    }
    const resultado = pagos.procesarPago({ numeroTarjeta: v.tarjeta, monto: total });
    const digitos = v.tarjeta.replace(/\D/g, "");
    const orden = store.crearOrden({
      estado: resultado.aprobado ? "pagada" : "rechazada",
      motivoRechazo: resultado.aprobado ? undefined : resultado.motivo,
      codigoAutorizacion: resultado.aprobado ? resultado.codigoAutorizacion : undefined,
      cliente: { nombre: v.nombre.trim(), apellidos: v.apellidos.trim(), correo: v.correo.trim() },
      direccion: { calle: v.calle.trim(), departamento: v.departamento.trim(), region: v.region, comuna: v.comuna, indicaciones: v.indicaciones.trim() },
      fechaInicio: v.fechaInicio,
      tarjeta: "•••• " + digitos.slice(-4),
      usuarioCorreo: sesion.correo,
      items: items.map((p) => ({ propiedadId: p.id, nombre: p.nombre, comuna: p.comuna, imagen: getMainImage(p), precio: precioFinal(p) })),
      total
    });
    if (resultado.aprobado) {
      items.forEach((p) => store.quitarSolicitud(p.id));
      toast("Pago aprobado. ¡Reserva confirmada!", "success");
      navigate("/compra/exito/" + orden.id);
    } else {
      toast("No se pudo realizar el pago", "error");
      navigate("/compra/error/" + orden.id);
    }
  }

  return (
    <form className="row g-4" onSubmit={onSubmit} noValidate>
      <div className="col-lg-7 order-2 order-lg-1">
        <div className="form-panel">
          <FormAlert alert={alert} />
          <h2 className="h4">Información del cliente</h2>
          <p className="small text-mute">Completa la siguiente información.</p>
          <div className="row g-3">
            <FormField label="Nombre *" htmlFor="ck-nombre" status={status.nombre} className="col-md-6">
              <input className="form-control" {...bind("nombre", "ck-")} autoComplete="given-name" />
            </FormField>
            <FormField label="Apellidos *" htmlFor="ck-apellidos" status={status.apellidos} className="col-md-6">
              <input className="form-control" {...bind("apellidos", "ck-")} autoComplete="family-name" />
            </FormField>
            <FormField label="Correo *" htmlFor="ck-correo" status={status.correo} className="col-md-6">
              <input type="email" className="form-control" {...bind("correo", "ck-")} autoComplete="email" />
            </FormField>
            <FormField label="Inicio del arriendo *" htmlFor="ck-fechaInicio" status={status.fechaInicio} className="col-md-6">
              <input type="date" className="form-control" {...bind("fechaInicio", "ck-")} min={hoyISO()} />
            </FormField>
          </div>

          <h2 className="h4 mt-4">Domicilio de contacto</h2>
          <p className="small text-mute">Donde podemos enviarte el contrato y la boleta.</p>
          <div className="row g-3">
            <FormField label="Calle y número *" htmlFor="ck-calle" status={status.calle} className="col-md-8">
              <input className="form-control" {...bind("calle", "ck-")} autoComplete="street-address" />
            </FormField>
            <FormField label="Departamento (opcional)" htmlFor="ck-departamento" status={status.departamento} className="col-md-4">
              <input className="form-control" {...bind("departamento", "ck-")} placeholder="Ej: 603" />
            </FormField>
            <RegionComunaFields form={form} prefix="ck-" />
            <FormField label="Indicaciones (opcional)" htmlFor="ck-indicaciones" status={status.indicaciones}>
              <textarea className="form-control" rows={2} {...bind("indicaciones", "ck-")} placeholder="Ej: horario para llamarte, referencias." />
            </FormField>
          </div>

          <h2 className="h4 mt-4">Pago con tarjeta</h2>
          <div className="alert alert-info test-cards py-2">
            <strong>Pago simulado.</strong> Aprobada: {TARJETAS_PRUEBA.aprobada} · Rechazada: {TARJETAS_PRUEBA.rechazada} · cualquier fecha futura y CVV.
          </div>
          <div className="row g-3">
            <FormField label="Titular de la tarjeta *" htmlFor="ck-titular" status={status.titular}>
              <input className="form-control" {...bind("titular", "ck-")} autoComplete="cc-name" />
            </FormField>
            <FormField label="Número de tarjeta *" htmlFor="ck-tarjeta" status={status.tarjeta} className="col-md-6">
              <input className="form-control" {...bind("tarjeta", "ck-")} inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" maxLength={23} />
            </FormField>
            <FormField label="Vencimiento *" htmlFor="ck-vencimiento" status={status.vencimiento} className="col-6 col-md-3">
              <input className="form-control" {...bind("vencimiento", "ck-")} autoComplete="cc-exp" placeholder="MM/AA" maxLength={5} />
            </FormField>
            <FormField label="CVV *" htmlFor="ck-cvv" status={status.cvv} className="col-6 col-md-3">
              <input className="form-control" {...bind("cvv", "ck-")} inputMode="numeric" autoComplete="cc-csc" maxLength={4} />
            </FormField>
          </div>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-4">
            <Link to="/solicitudes" className="btn btn-outline-secondary">← Volver a mis solicitudes</Link>
            <button type="submit" className="btn btn-success btn-lg">Pagar ahora {formatPrice(total)}</button>
          </div>
        </div>
      </div>

      <div className="col-lg-5 order-1 order-lg-2">
        <aside className="card p-3 p-md-4 position-sticky" style={{ top: 96 }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 mb-0">Tu reserva</h2>
            <span className="badge text-bg-primary fs-6">Total: {formatPrice(total)}</span>
          </div>
          <ul className="list-group list-group-flush">
            {items.map((p) => (
              <li key={p.id} className="list-group-item d-flex align-items-center gap-3 px-0">
                <img src={getMainImage(p)} alt="" className="thumb-xs" />
                <div className="flex-grow-1 small">
                  <strong className="d-block">{p.nombre}</strong>
                  <span className="text-mute">{p.comuna}</span>
                </div>
                <span className="small fw-semibold text-nowrap">{formatPrice(precioFinal(p))}</span>
              </li>
            ))}
          </ul>
          <p className="form-text mb-0 mt-2">Se cobra el primer mes de cada propiedad como reserva.</p>
        </aside>
      </div>
    </form>
  );
}

export default function Checkout() {
  useTitle("Pagar reserva — AuraArriendos");
  const sesion = useSession();
  const [params] = useSearchParams();

  if (!sesion) return <Navigate to={"/login?aviso=solicitudes&next=" + encodeURIComponent("/checkout")} replace />;

  const reintentar = params.get("reintentar");
  const ordenPrevia = reintentar ? store.getOrdenPorId(reintentar) : null;
  const items = store.getSolicitudes().map((id) => store.getPropiedadPorId(id)).filter(disponibleParaReservar);

  return (
    <section className="container section-tight">
      <p className="eyebrow">Paso de pago</p>
      <h1 className="h2 mb-4">Confirma y paga tu reserva</h1>
      {items.length ? (
        <Formulario key={reintentar || "nuevo"} sesion={sesion} items={items} ordenPrevia={ordenPrevia} />
      ) : (
        <EmptyState glyph="🧾" title="No tienes propiedades para reservar">
          <p>Agrega propiedades disponibles a tus solicitudes para continuar.</p>
          <Link to="/propiedades" className="btn btn-primary">Ver propiedades</Link>
        </EmptyState>
      )}
    </section>
  );
}
