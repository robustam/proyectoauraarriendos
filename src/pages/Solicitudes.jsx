import { Link, useNavigate } from "react-router-dom";
import Reveal from "../components/Reveal";
import { EmptyState } from "../components/ui";
import * as store from "../services/store";
import { useToast } from "../context/ToastContext";
import { useStoreVersion } from "../hooks/useStore";
import useSolicitudToggle from "../hooks/useSolicitudToggle";
import useTitle from "../hooks/useTitle";
import { disponibleParaReservar, enOferta, formatPrice, getMainImage, precioFinal } from "../services/format";

/* "Mis solicitudes": el carrito de la tienda. Desde aquí se va al Checkout
   para pagar la reserva (primer mes) o solo se avisa el interés. */
export default function Solicitudes() {
  useTitle("Mis solicitudes — AuraArriendos");
  useStoreVersion();
  const toast = useToast();
  const navigate = useNavigate();
  const { requireLogin } = useSolicitudToggle();

  const propiedades = store.getSolicitudes().map((id) => store.getPropiedadPorId(id)).filter(Boolean);
  const reservables = propiedades.filter(disponibleParaReservar);
  const total = reservables.reduce((acc, p) => acc + precioFinal(p), 0);

  function enviarInteres() {
    if (!propiedades.length || !requireLogin()) return;
    store.vaciarSolicitudes();
    toast("Enviamos tu interés a los arrendadores. Te contactarán a la brevedad.", "success");
  }

  function irAPagar() {
    if (!reservables.length || !requireLogin()) return;
    navigate("/checkout");
  }

  return (
    <>
      <Reveal as="section" className="page-hero container">
        <p className="eyebrow">Tu lista guardada</p>
        <h1>Mis solicitudes de arriendo</h1>
        <p className="lede">Guarda las propiedades que te interesan. Puedes reservarlas pagando el primer mes o solo avisar tu interés a los arrendadores.</p>
      </Reveal>

      <section className="container section-tight pt-0">
        {propiedades.length ? (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="table-responsive table-card">
                <table className="table align-middle">
                  <thead><tr><th>Imagen</th><th>Propiedad</th><th className="text-end">Precio / mes</th><th className="text-end">Acciones</th></tr></thead>
                  <tbody>
                    {propiedades.map((p) => (
                      <tr key={p.id}>
                        <td><Link to={"/propiedades/" + encodeURIComponent(p.id)}><img src={getMainImage(p)} alt={p.nombre} className="thumb-sm" /></Link></td>
                        <td>
                          <Link to={"/propiedades/" + encodeURIComponent(p.id)} className="fw-semibold text-body">{p.nombre}</Link>
                          <div className="small text-mute">{p.comuna}</div>
                          {!disponibleParaReservar(p) && <div className="small text-danger">No disponible para reservar por ahora.</div>}
                        </td>
                        <td className="text-end text-nowrap">
                          {enOferta(p) && <span className="precio-anterior d-block">{formatPrice(p.precio)}</span>}
                          {formatPrice(precioFinal(p))}
                        </td>
                        <td className="text-end">
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => store.quitarSolicitud(p.id)}>Quitar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-lg-4">
              <aside className="card p-4">
                <h2 className="h4 mb-3">Resumen</h2>
                <div className="summary-row"><span>Propiedades guardadas</span><strong>{propiedades.length}</strong></div>
                <div className="summary-row"><span>Disponibles para reservar</span><strong>{reservables.length}</strong></div>
                <div className="summary-row total"><span>Reserva (1er mes)</span><strong data-testid="total-solicitudes">{formatPrice(total)}</strong></div>
                <button type="button" className="btn btn-success w-100 mt-3" onClick={irAPagar} disabled={!reservables.length}>Reservar y pagar</button>
                <button type="button" className="btn btn-outline-secondary w-100 mt-2" onClick={enviarInteres}>Solo enviar mi interés</button>
                <p className="form-text mt-2 mb-0">"Solo enviar mi interés" notifica a los arrendadores y vacía tu lista.</p>
              </aside>
            </div>
          </div>
        ) : (
          <EmptyState glyph="♡" title="Aún no guardas propiedades">
            <p>Explora el catálogo y toca el corazón en cualquier propiedad para guardarla aquí.</p>
            <Link to="/propiedades" className="btn btn-primary">Ver propiedades</Link>
          </EmptyState>
        )}
      </section>
    </>
  );
}
