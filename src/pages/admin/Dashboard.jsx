import { Link, useOutletContext } from "react-router-dom";
import { AdminHeader, EmptyState } from "../../components/ui";
import { MENU_ADMIN } from "../../components/AdminLayout";
import * as store from "../../services/store";
import { useStoreVersion } from "../../hooks/useStore";
import useTitle from "../../hooks/useTitle";
import { formatPrice, getMainImage, recortar } from "../../services/format";

const DESCRIPCIONES = {
  "/admin": "Visión general de las métricas clave.",
  "/admin/ordenes": "Reservas pagadas y rechazadas, con su boleta.",
  "/admin/propiedades": "Inventario, aprobación y estado de cada propiedad.",
  "/admin/stock-critico": "Propiedades con pocas unidades disponibles.",
  "/admin/categorias": "Organiza las propiedades por tipo.",
  "/admin/visitas": "Visitas al inmueble y entregas de llaves.",
  "/admin/usuarios": "Cuentas de usuario y sus roles.",
  "/admin/blog": "Artículos del blog público.",
  "/admin/mensajes": "Mensajes del formulario de contacto.",
  "/admin/reportes": "Ingresos y distribución del catálogo.",
  "/admin/perfil": "Tus datos personales y contraseña."
};

export default function Dashboard() {
  useTitle("Panel de administración — AuraArriendos");
  useStoreVersion();
  const { sesion, esAdmin } = useOutletContext();

  const propiedades = store.getPropiedades();
  const pendientes = propiedades.filter((p) => p.estado === "pendiente");
  const publicadas = propiedades.filter((p) => p.estado === "publicada" && !p.arrendada);
  const ordenes = store.getOrdenes();
  const pagadas = ordenes.filter((o) => o.estado === "pagada");
  const ingresos = pagadas.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const usuarios = store.getUsuarios();
  const clientes = usuarios.filter((u) => u.tipoUsuario === "Cliente").length;
  const criticas = store.getPropiedadesCriticas().length;
  const noLeidos = store.getMensajes().filter((m) => !m.leido);
  const modulos = MENU_ADMIN.filter((m) => m.to !== "/admin" && (esAdmin || !m.soloAdmin));

  const tarjetas = [
    { titulo: "Reservas pagadas", valor: pagadas.length, pie: "Ingresos: " + formatPrice(ingresos), icono: "🧾", color: "bg-primary", to: "/admin/ordenes" },
    { titulo: "Propiedades", valor: propiedades.length, pie: publicadas.length + " publicadas · " + criticas + " en stock crítico", icono: "🏘️", color: "bg-success", to: "/admin/propiedades" },
    { titulo: "Usuarios", valor: usuarios.length, pie: "Clientes registrados: " + clientes, icono: "👥", color: "bg-warning", to: esAdmin ? "/admin/usuarios" : null }
  ];

  return (
    <>
      <AdminHeader eyebrow="Resumen de las actividades" title={"Hola, " + sesion.nombre + " 👋"}>
        {esAdmin && <Link to="/admin/propiedades/nueva" className="btn btn-primary">+ Nueva propiedad</Link>}
      </AdminHeader>

      <div className="row g-3 mb-4">
        {tarjetas.map((t) => {
          const cuerpo = (
            <div className={"card stat-card h-100 " + t.color}>
              <div className="card-body d-flex align-items-center gap-3">
                <span className="stat-icon" aria-hidden="true">{t.icono}</span>
                <div><span className="small fw-semibold d-block opacity-75">{t.titulo}</span><strong data-testid={"stat-" + t.titulo}>{t.valor}</strong></div>
              </div>
              <div className="stat-foot px-3 py-2 text-center">{t.pie}</div>
            </div>
          );
          return (
            <div className="col-md-4" key={t.titulo}>
              {t.to ? <Link to={t.to} className="d-block h-100">{cuerpo}</Link> : cuerpo}
            </div>
          );
        })}
      </div>

      <div className="row g-3 row-cols-2 row-cols-md-3 row-cols-xl-5 mb-4">
        {modulos.map((m) => (
          <div className="col" key={m.to}>
            <Link to={m.to} className="card module-card">
              <span className="module-icon" aria-hidden="true">{m.icon}</span>
              <strong className="d-block small">{m.label}</strong>
              <p>{DESCRIPCIONES[m.to]}</p>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className={esAdmin ? "col-xl-6" : "col-12"}>
          <div className="card p-4 h-100">
            <h2 className="h5 mb-3">Publicaciones pendientes de revisión ({pendientes.length})</h2>
            {pendientes.length ? (
              <ul className="list-group list-group-flush">
                {pendientes.slice(0, 4).map((p) => (
                  <li key={p.id} className="list-group-item px-0 d-flex align-items-center gap-3">
                    <img src={getMainImage(p)} alt="" className="thumb-xs" />
                    <div className="flex-grow-1 small"><strong className="d-block">{p.nombre}</strong><span className="text-mute">{p.comuna} · {formatPrice(p.precio)} · {p.publicadoPor || "—"}</span></div>
                    <Link to="/admin/propiedades?estado=pendiente" className="btn btn-outline-secondary btn-sm">Revisar</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState glyph="✅" title="Sin publicaciones pendientes"><p className="mb-0">Todo al día.</p></EmptyState>
            )}
          </div>
        </div>
        {esAdmin && (
          <div className="col-xl-6">
            <div className="card p-4 h-100">
              <h2 className="h5 mb-3">Mensajes sin leer ({noLeidos.length})</h2>
              {noLeidos.length ? (
                <>
                  <ul className="list-group list-group-flush">
                    {noLeidos.slice(0, 4).map((m) => (
                      <li key={m.id} className="list-group-item px-0 small">
                        <strong>{m.nombre}</strong> <span className="text-mute">· {new Date(m.fecha).toLocaleDateString("es-CL")}</span>
                        <div>{recortar(m.comentario, 80)}</div>
                      </li>
                    ))}
                  </ul>
                  <Link to="/admin/mensajes" className="btn btn-outline-secondary btn-sm mt-3">Ir al Inbox</Link>
                </>
              ) : (
                <EmptyState glyph="📭" title="Sin mensajes nuevos"><p className="mb-0"><Link to="/admin/mensajes">Ir al Inbox</Link></p></EmptyState>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
