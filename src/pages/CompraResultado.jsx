import { Link, useParams } from "react-router-dom";
import BoletaDetalle from "../components/BoletaDetalle";
import { EmptyState } from "../components/ui";
import * as store from "../services/store";
import useTitle from "../hooks/useTitle";
import { formatPrice } from "../utils/format";

/* Resultado del pago: "Pago correcto" (/compra/exito/:id) o
   "Pago con error" (/compra/error/:id). Muestra la boleta de la orden. */
export default function CompraResultado() {
  const { id } = useParams();
  const orden = store.getOrdenPorId(id);
  const pagada = !!orden && orden.estado === "pagada";
  useTitle((pagada ? "Reserva confirmada" : "Pago rechazado") + " — AuraArriendos");

  if (!orden) {
    return (
      <section className="container section">
        <EmptyState glyph="🧾" title="No encontramos esa orden">
          <Link to="/" className="btn btn-primary">Volver al inicio</Link>
        </EmptyState>
      </section>
    );
  }

  const cuerpoCorreo = "Reserva nro #" + orden.numero + "\n" +
    orden.items.map((it) => "- " + it.nombre + ": " + formatPrice(it.precio)).join("\n") +
    "\nTotal pagado: " + formatPrice(orden.total);

  return (
    <section className="container section-tight">
      <div className="form-panel mx-auto" style={{ maxWidth: 860 }}>
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
          <div className="d-flex align-items-center gap-3">
            <span className={"result-icon " + (pagada ? "text-success" : "text-danger")} aria-hidden="true">{pagada ? "✔" : "✖"}</span>
            <div>
              <h1 className="h3 mb-1">
                {pagada ? "Se ha realizado la reserva nro #" + orden.numero : "No se pudo realizar el pago nro #" + orden.numero}
              </h1>
              <p className="small text-mute mb-0">
                {pagada ? "Te enviamos el detalle a " + orden.cliente.correo + "." : orden.motivoRechazo || "El pago fue rechazado."}
              </p>
            </div>
          </div>
          <small className="text-mute">Código orden: {orden.id}</small>
        </div>

        {!pagada && (
          <div className="text-center my-3 no-print">
            <Link to={"/checkout?reintentar=" + encodeURIComponent(orden.id)} className="btn btn-success btn-lg">Volver a realizar el pago</Link>
          </div>
        )}

        <BoletaDetalle orden={orden} />

        <div className="d-flex flex-wrap justify-content-center gap-2 mt-4 no-print">
          {pagada && (
            <>
              <button type="button" className="btn btn-danger" onClick={() => window.print()}>Imprimir boleta en PDF</button>
              <a
                className="btn btn-success"
                href={"mailto:" + encodeURIComponent(orden.cliente.correo) + "?subject=" + encodeURIComponent("Boleta AuraArriendos #" + orden.numero) + "&body=" + encodeURIComponent(cuerpoCorreo)}
              >
                Enviar boleta por email
              </a>
            </>
          )}
          <Link to="/propiedades" className="btn btn-outline-secondary">Seguir explorando</Link>
        </div>
      </div>
    </section>
  );
}
