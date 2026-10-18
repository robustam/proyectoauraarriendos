import { Link, Navigate, useOutletContext, useParams } from "react-router-dom";
import { AdminHeader, StatusPill } from "../../components/ui";
import * as store from "../../services/store";
import { useStoreVersion } from "../../hooks/useStore";
import useTitle from "../../hooks/useTitle";
import { enOferta, formatFechaHora, formatPrice, getImagenes, precioFinal } from "../../utils/format";

/* "Mostrar producto": ficha interna de una propiedad con todos sus datos,
   su stock y las órdenes en las que aparece. Desde aquí se pasa a Editar. */
function Fila({ label, children }) {
  return (
    <div className="row py-2 border-bottom small">
      <div className="col-5 text-mute">{label}</div>
      <div className="col-7 fw-semibold">{children}</div>
    </div>
  );
}

export default function PropiedadAdminDetalle() {
  useStoreVersion();
  const { id } = useParams();
  const { esAdmin } = useOutletContext();
  const p = store.getPropiedadPorId(id);
  useTitle((p ? p.nombre : "Propiedad") + " — Panel AuraArriendos");
  if (!p) return <Navigate to="/admin/propiedades" replace />;

  const fotos = getImagenes(p);
  const critico = p.alertaDisponibilidad != null && Number(p.unidadesDisponibles) <= Number(p.alertaDisponibilidad);
  const ordenes = store.getOrdenes().filter((o) => o.items.some((it) => it.propiedadId === p.id));
  const dueno = p.publicadoPor ? store.getUsuarioPorCorreo(p.publicadoPor) : null;

  return (
    <>
      <AdminHeader eyebrow={"Propiedad " + p.codigo} title={p.nombre}>
        <Link to="/admin/propiedades" className="btn btn-outline-secondary">← Volver</Link>
        <Link to={"/propiedades/" + encodeURIComponent(p.id)} className="btn btn-outline-secondary" target="_blank" rel="noopener">Ver en la tienda</Link>
        {esAdmin && <Link to={"/admin/propiedades/" + encodeURIComponent(p.id) + "/editar"} className="btn btn-primary">Editar propiedad</Link>}
      </AdminHeader>

      {critico && <div className="alert alert-warning">⚠️ Stock crítico: quedan {p.unidadesDisponibles} unidades (alerta configurada en {p.alertaDisponibilidad}).</div>}

      <div className="row g-4">
        <div className="col-xl-5">
          <div className="card p-3">
            <div className="detail-main-img mb-2"><img src={fotos[0]} alt={p.nombre} /></div>
            <div className="d-flex gap-2 flex-wrap">
              {fotos.slice(1).map((f, i) => <img key={f + i} src={f} alt={"Foto " + (i + 2)} className="thumb-sm" />)}
            </div>
          </div>
        </div>
        <div className="col-xl-7">
          <div className="card p-4">
            <div className="d-flex flex-wrap gap-2 mb-2">
              <StatusPill estado={p.arrendada ? "arrendada" : p.estado} />
              {p.destacada && <span className="badge rounded-pill text-bg-primary">Destacada</span>}
              {enOferta(p) && <span className="badge rounded-pill badge-oferta">En oferta</span>}
            </div>
            <Fila label="Categoría">{p.categoria}</Fila>
            <Fila label="Ubicación">{p.direccion}, {p.comuna} ({p.region})</Fila>
            <Fila label="Precio mensual">{formatPrice(p.precio)}{enOferta(p) && " → oferta " + formatPrice(precioFinal(p))}</Fila>
            <Fila label="Dormitorios / baños">{p.dormitorios} / {p.banos}</Fila>
            <Fila label="Superficie">{p.m2} m²</Fila>
            <Fila label="Estacionamiento">{p.estacionamiento ? "Sí" : "No"}</Fila>
            <Fila label="Stock disponible">{p.unidadesDisponibles}</Fila>
            <Fila label="Stock crítico">{p.alertaDisponibilidad ?? "No definido"}</Fila>
            <Fila label="Publicada por">{dueno ? dueno.nombre + " " + dueno.apellidos + " (" + p.publicadoPor + ")" : p.publicadoPor || "Equipo AuraArriendos"}</Fila>
            {p.motivoRechazo && <Fila label="Motivo de rechazo">{p.motivoRechazo}</Fila>}
            <p className="small text-mute mt-3 mb-0">{p.descripcion}</p>
          </div>
        </div>
      </div>

      <div className="card p-4 mt-4">
        <h2 className="h5 mb-3">Órdenes con esta propiedad ({ordenes.length})</h2>
        {ordenes.length ? (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead><tr><th>N°</th><th>Fecha</th><th>Cliente</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {ordenes.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.numero}</td>
                    <td>{formatFechaHora(o.fecha)}</td>
                    <td>{o.cliente.nombre} {o.cliente.apellidos}</td>
                    <td><StatusPill estado={o.estado} /></td>
                    <td className="text-end"><Link to={"/admin/ordenes/" + o.id} className="btn btn-outline-secondary btn-sm">Ver boleta</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-mute small mb-0">Esta propiedad aún no aparece en ninguna orden.</p>}
      </div>
    </>
  );
}
