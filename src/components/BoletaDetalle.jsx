import { formatFechaHora, formatFechaLarga, formatPrice } from "../services/format";

/* Detalle de una orden (boleta): datos del cliente, domicilio, propiedades
   reservadas y total. Lo usan la vista de compra exitosa / con error y el
   panel de administración (Mostrar boleta). Solo lectura. */
function Dato({ label, value, className = "col-md-4" }) {
  return (
    <div className={className}>
      <label className="form-label mb-1">{label}</label>
      <input className="form-control" value={value || "—"} readOnly disabled />
    </div>
  );
}

export default function BoletaDetalle({ orden }) {
  const pagada = orden.estado === "pagada";
  return (
    <>
      <div className="row g-3">
        <Dato label="Nombre" value={orden.cliente.nombre} />
        <Dato label="Apellidos" value={orden.cliente.apellidos} />
        <Dato label="Correo" value={orden.cliente.correo} />
      </div>

      <h3 className="h6 mt-4 mb-2">Domicilio de contacto</h3>
      <div className="row g-3">
        <Dato label="Calle" value={orden.direccion.calle} className="col-md-8" />
        <Dato label="Departamento" value={orden.direccion.departamento} />
        <Dato label="Región" value={orden.direccion.region} className="col-md-6" />
        <Dato label="Comuna" value={orden.direccion.comuna} className="col-md-6" />
        {orden.direccion.indicaciones && <Dato label="Indicaciones" value={orden.direccion.indicaciones} className="col-12" />}
      </div>

      <div className="row g-3 mt-1 small text-mute">
        <div className="col-sm-6">Fecha de la orden: <strong className="text-body">{formatFechaHora(orden.fecha)}</strong></div>
        <div className="col-sm-6">Inicio del arriendo: <strong className="text-body">{formatFechaLarga(orden.fechaInicio)}</strong></div>
        <div className="col-sm-6">Medio de pago: <strong className="text-body">Tarjeta {orden.tarjeta}</strong></div>
        {pagada && <div className="col-sm-6">Autorización: <strong className="text-body">{orden.codigoAutorizacion}</strong></div>}
      </div>

      <div className="table-responsive table-card mt-4">
        <table className="table align-middle">
          <thead><tr><th>Imagen</th><th>Propiedad</th><th>Comuna</th><th className="text-end">Reserva (1 mes)</th></tr></thead>
          <tbody>
            {orden.items.map((it) => (
              <tr key={it.propiedadId}>
                <td><img src={it.imagen} alt="" className="thumb-xs" /></td>
                <td>{it.nombre}</td>
                <td>{it.comuna}</td>
                <td className="text-end">{formatPrice(it.precio)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card mt-3 p-3 text-center">
        <span className="fs-5">{pagada ? "Total pagado" : "Total"}: <strong data-testid="total-orden">{formatPrice(orden.total)}</strong></span>
      </div>
    </>
  );
}
