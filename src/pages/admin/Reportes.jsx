import { AdminHeader } from "../../components/ui";
import * as store from "../../services/store";
import { useStoreVersion } from "../../hooks/useStore";
import useTitle from "../../hooks/useTitle";
import { enOferta, formatPrice } from "../../utils/format";

/* Reportes: ingresos por mes, tasa de aprobación de pagos y distribución
   del catálogo (por categoría, estado y comuna). Gráficos hechos con
   componentes de Bootstrap (progress) y CSS, sin librerías extra. */
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/* Ingresos de órdenes pagadas en los últimos `n` meses (incluye el actual). */
export function ingresosPorMes(ordenes, n = 6, hoy = new Date()) {
  const meses = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    meses.push({ clave: d.getFullYear() + "-" + d.getMonth(), etiqueta: MESES[d.getMonth()], total: 0 });
  }
  ordenes.filter((o) => o.estado === "pagada").forEach((o) => {
    const d = new Date(o.fecha);
    const m = meses.find((x) => x.clave === d.getFullYear() + "-" + d.getMonth());
    if (m) m.total += Number(o.total || 0);
  });
  return meses;
}

function contarPor(lista, campo) {
  const mapa = {};
  lista.forEach((x) => { const k = typeof campo === "function" ? campo(x) : x[campo]; mapa[k] = (mapa[k] || 0) + 1; });
  return Object.entries(mapa).map(([nombre, cantidad]) => ({ nombre, cantidad })).sort((a, b) => b.cantidad - a.cantidad);
}

function Barras({ datos, total, capitalizar = false }) {
  return (
    <div className="d-grid gap-3">
      {datos.map((d) => {
        const pct = total ? Math.round((d.cantidad / total) * 100) : 0;
        return (
          <div key={d.nombre}>
            <div className="d-flex justify-content-between small mb-1"><span className={capitalizar ? "text-capitalize" : ""}>{d.nombre}</span><strong>{d.cantidad} ({pct}%)</strong></div>
            <div className="progress" role="progressbar" aria-label={d.nombre} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="progress-bar" style={{ width: pct + "%" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Reportes() {
  useTitle("Reportes — Panel AuraArriendos");
  useStoreVersion();
  const ordenes = store.getOrdenes();
  const props = store.getPropiedades();
  const pagadas = ordenes.filter((o) => o.estado === "pagada");
  const ingresos = pagadas.reduce((a, o) => a + o.total, 0);
  const tasa = ordenes.length ? Math.round((pagadas.length / ordenes.length) * 100) : 0;
  const ticket = pagadas.length ? Math.round(ingresos / pagadas.length) : 0;
  const meses = ingresosPorMes(ordenes);
  const maxMes = Math.max(1, ...meses.map((m) => m.total));
  const porCategoria = contarPor(props, "categoria");
  const porEstado = contarPor(props, (p) => (p.arrendada ? "arrendada" : p.estado));
  const porComuna = contarPor(props, "comuna").slice(0, 5);

  const kpis = [
    { label: "Ingresos por reservas", valor: formatPrice(ingresos) },
    { label: "Órdenes pagadas", valor: pagadas.length },
    { label: "Tasa de aprobación", valor: tasa + "%" },
    { label: "Ticket promedio", valor: formatPrice(ticket) },
    { label: "Propiedades en oferta", valor: props.filter(enOferta).length },
    { label: "En stock crítico", valor: store.getPropiedadesCriticas().length }
  ];

  return (
    <>
      <AdminHeader eyebrow="Análisis" title="Reportes" />
      <div className="row g-3 row-cols-2 row-cols-md-3 row-cols-xl-6 mb-4">
        {kpis.map((k) => (
          <div className="col" key={k.label}><div className="stat-mini h-100"><strong className="fs-4">{k.valor}</strong><span>{k.label}</span></div></div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-xl-7">
          <div className="card p-4 h-100">
            <h2 className="h5">Ingresos por mes (últimos 6 meses)</h2>
            <div className="bar-chart" aria-label="Gráfico de ingresos por mes">
              {meses.map((m) => (
                <div className="bar" key={m.clave}>
                  <b>{m.total ? formatPrice(m.total).replace("$", "$ ") : ""}</b>
                  <div className="bar-fill" style={{ height: (m.total / maxMes) * 100 + "%" }} title={formatPrice(m.total)} />
                  <small>{m.etiqueta}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-xl-5">
          <div className="card p-4 h-100">
            <h2 className="h5 mb-3">Propiedades por categoría</h2>
            <Barras datos={porCategoria} total={props.length} />
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-4 h-100">
            <h2 className="h5 mb-3">Propiedades por estado</h2>
            <Barras datos={porEstado} total={props.length} capitalizar />
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-4 h-100">
            <h2 className="h5 mb-3">Comunas con más propiedades</h2>
            <Barras datos={porComuna} total={props.length} />
          </div>
        </div>
      </div>
    </>
  );
}
