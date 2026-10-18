import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import * as store from "../services/store";
import { useSession, useStoreVersion } from "../hooks/useStore";

/* Layout del panel: protege el acceso (solo Administrador y Agente) y pinta
   el menú lateral. En escritorio el menú queda fijo a la izquierda; en
   celular se pliega en un botón (navbar-expand-lg de Bootstrap). */
export const MENU_ADMIN = [
  { to: "/admin", label: "Dashboard", icon: "🏠", end: true },
  { to: "/admin/ordenes", label: "Órdenes", icon: "🧾" },
  { to: "/admin/propiedades", label: "Propiedades", icon: "🏘️" },
  { to: "/admin/stock-critico", label: "Stock crítico", icon: "⚠️" },
  { to: "/admin/categorias", label: "Categorías", icon: "🏷️", soloAdmin: true },
  { to: "/admin/visitas", label: "Visitas y entregas", icon: "📅" },
  { to: "/admin/usuarios", label: "Usuarios", icon: "👤", soloAdmin: true },
  { to: "/admin/blog", label: "Blog", icon: "📝", soloAdmin: true },
  { to: "/admin/mensajes", label: "Inbox", icon: "📥", soloAdmin: true },
  { to: "/admin/reportes", label: "Reportes", icon: "📊" },
  { to: "/admin/perfil", label: "Mi perfil", icon: "🙂" }
];

export default function AdminLayout() {
  useStoreVersion();
  const sesion = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  if (!store.esStaff(sesion)) return <Navigate to="/login" replace />;

  const esAdmin = sesion.tipoUsuario === "Administrador";
  const noLeidos = store.contarMensajesNoLeidos();
  const items = MENU_ADMIN.filter((m) => esAdmin || !m.soloAdmin);

  function logout() {
    store.cerrarSesion();
    navigate("/login");
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <aside className="col-lg-3 col-xl-2 admin-sidebar navbar navbar-expand-lg align-items-start p-3">
          <div className="d-flex flex-lg-column w-100 h-100 flex-wrap align-items-center align-items-lg-stretch">
            <Link to="/admin" className="navbar-brand mb-lg-3"><span className="brand-mark">A</span>AuraArriendos</Link>
            <button
              className="navbar-toggler ms-auto" type="button" aria-controls="menu-admin"
              aria-expanded={menuOpen} aria-label="Abrir menú del panel" onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div className={"collapse navbar-collapse flex-column align-items-stretch w-100 flex-grow-1" + (menuOpen ? " show" : "")} id="menu-admin">
              <nav className="nav flex-column gap-1 w-100 mt-3 mt-lg-0" aria-label="Menú del panel">
                {items.map((m) => (
                  <NavLink key={m.to} to={m.to} end={m.end} className="nav-link">
                    <span aria-hidden="true">{m.icon}</span> {m.label}
                    {m.to === "/admin/mensajes" && noLeidos > 0 && <span className="badge rounded-pill text-bg-warning ms-auto">{noLeidos}</span>}
                  </NavLink>
                ))}
                <Link to="/" className="nav-link link-tienda mt-2"><span aria-hidden="true">🏬</span> Ver tienda</Link>
              </nav>
              <div className="mt-4 mt-lg-auto pt-3 border-top border-secondary-subtle w-100">
                <div className="d-flex align-items-center gap-2">
                  <div className="admin-avatar">{(sesion.nombre || "?").charAt(0).toUpperCase()}</div>
                  <div className="lh-sm">
                    <strong className="d-block small text-white" data-testid="admin-nombre">{sesion.nombre}</strong>
                    <span className="small opacity-75">{sesion.tipoUsuario}</span>
                  </div>
                </div>
                <button type="button" className="btn btn-sm w-100 mt-2 btn-logout" onClick={logout}>Cerrar sesión</button>
              </div>
            </div>
          </div>
        </aside>
        <main className="col-lg-9 col-xl-10 admin-main p-3 p-md-4 p-xl-5">
          <Outlet context={{ sesion, esAdmin }} />
        </main>
      </div>
    </div>
  );
}

/* Envuelve rutas exclusivas del Administrador; el Agente vuelve al dashboard. */
export function RequireAdmin({ children }) {
  const sesion = useSession();
  if (!sesion || sesion.tipoUsuario !== "Administrador") return <Navigate to="/admin" replace />;
  return children;
}
