import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import * as store from "../services/store";
import { useSession, useStoreVersion } from "../hooks/useStore";
import { formatPrice, precioFinal } from "../utils/format";

/* Barra de navegación (Navbar de Bootstrap).
   - Fila 1: marca, buscador, botón de solicitudes ("carrito") y sesión.
   - Fila 2: enlaces de navegación con el menú desplegable de categorías.
   - En pantallas chicas todo se pliega detrás del botón hamburguesa. */
const LINKS = [
  { to: "/", label: "Inicio", end: true },
  { to: "/propiedades", label: "Propiedades" },
  { to: "/ofertas", label: "Ofertas" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/blog", label: "Blog" },
  { to: "/contacto", label: "Contacto" },
  { to: "/publicar", label: "Publicar arriendo" }
];

function Buscador({ className = "", onBuscar }) {
  const [texto, setTexto] = useState("");
  return (
    <form
      className={"d-flex gap-2 navbar-search " + className}
      role="search"
      onSubmit={(e) => { e.preventDefault(); onBuscar(texto.trim()); setTexto(""); }}
    >
      <input
        className="form-control" type="search" placeholder="Buscar comuna, tipo…" aria-label="Buscar propiedades"
        value={texto} onChange={(e) => setTexto(e.target.value)}
      />
      <button className="btn btn-outline-primary btn-sm" type="submit">Buscar</button>
    </form>
  );
}

export default function Header() {
  useStoreVersion();
  const sesion = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef(null);

  const solicitudes = store.getSolicitudes().map((id) => store.getPropiedadPorId(id)).filter(Boolean);
  const totalSolicitudes = solicitudes.reduce((acc, p) => acc + precioFinal(p), 0);
  const categorias = store.getCategorias();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Al navegar se cierran el menú móvil y el desplegable. */
  useEffect(() => { setMenuOpen(false); setCatOpen(false); }, [location.pathname, location.search]);

  /* Cierra el desplegable de categorías al hacer clic fuera de él. */
  useEffect(() => {
    if (!catOpen) return undefined;
    const fuera = (e) => { if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false); };
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [catOpen]);

  function buscar(q) {
    navigate(q ? "/propiedades?q=" + encodeURIComponent(q) : "/propiedades");
  }

  function logout() {
    store.cerrarSesion();
    navigate("/login");
  }

  const categoriasActivas = location.pathname.indexOf("/categorias") === 0;

  return (
    <header className={"site-header" + (scrolled ? " is-scrolled" : "")}>
      <nav className="navbar navbar-expand-lg py-2" aria-label="Navegación principal">
        <div className="container flex-wrap">
          <Link to="/" className="navbar-brand me-lg-4"><span className="brand-mark">A</span>AuraArriendos</Link>

          <Buscador className="d-none d-lg-flex flex-grow-1 mx-lg-4" onBuscar={buscar} />

          <div className="d-flex align-items-center gap-2 ms-auto">
            <Link to="/solicitudes" className="btn btn-success btn-sm cart-btn" aria-label={"Mis solicitudes: " + solicitudes.length}>
              ♥ <span className="d-none d-sm-inline">Solicitudes</span>
              <span className="badge rounded-pill text-bg-light ms-1" data-testid="contador-solicitudes">{solicitudes.length}</span>
              {totalSolicitudes > 0 && <span className="d-none d-xl-inline ms-1">· {formatPrice(totalSolicitudes)}</span>}
            </Link>
            {sesion ? (
              <div className="d-none d-lg-flex align-items-center gap-2">
                <span className="user-avatar">{(sesion.nombre || "?").trim().charAt(0).toUpperCase()}</span>
                <span className="small fw-semibold" data-testid="usuario-nombre">{sesion.nombre}</span>
                {store.esStaff(sesion) && <Link to="/admin" className="btn btn-outline-secondary btn-sm">Panel</Link>}
                <button className="btn btn-outline-secondary btn-sm" type="button" onClick={logout}>Salir</button>
              </div>
            ) : (
              <div className="d-none d-sm-flex gap-2">
                <Link to="/login" className="btn btn-outline-primary btn-sm">Ingresar</Link>
                <Link to="/registro" className="btn btn-primary btn-sm">Registrarse</Link>
              </div>
            )}
            <button
              className="navbar-toggler" type="button" aria-controls="menu-principal"
              aria-expanded={menuOpen} aria-label="Abrir menú" onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="navbar-toggler-icon" />
            </button>
          </div>

          <div className={"collapse navbar-collapse w-100 justify-content-center" + (menuOpen ? " show" : "")} id="menu-principal">
            <Buscador className="d-lg-none my-3" onBuscar={buscar} />
            <ul className="navbar-nav align-items-lg-center gap-lg-1 pt-lg-1">
              {LINKS.slice(0, 2).map((l) => (
                <li className="nav-item" key={l.to}><NavLink className="nav-link" to={l.to} end={l.end}>{l.label}</NavLink></li>
              ))}
              <li className="nav-item dropdown" ref={catRef}>
                <button
                  type="button" className={"nav-link dropdown-toggle btn btn-link" + (categoriasActivas ? " active" : "")}
                  aria-expanded={catOpen} onClick={() => setCatOpen((o) => !o)}
                >
                  Categorías
                </button>
                <ul className={"dropdown-menu" + (catOpen ? " show" : "")}>
                  <li><Link className="dropdown-item" to="/categorias">Ver todas</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  {categorias.map((c) => (
                    <li key={c.id}><Link className="dropdown-item" to={"/categorias/" + c.id}>{c.nombre}</Link></li>
                  ))}
                </ul>
              </li>
              {LINKS.slice(2).map((l) => (
                <li className="nav-item" key={l.to}><NavLink className="nav-link" to={l.to} end={l.end}>{l.label}</NavLink></li>
              ))}
            </ul>
            <div className="d-lg-none border-top mt-2 pt-2 pb-2">
              {sesion ? (
                <>
                  <p className="small text-mute mb-2">Sesión: <strong>{sesion.nombre}</strong></p>
                  <div className="d-flex gap-2">
                    {store.esStaff(sesion) && <Link to="/admin" className="btn btn-outline-secondary btn-sm">Panel</Link>}
                    <button className="btn btn-outline-secondary btn-sm" type="button" onClick={logout}>Cerrar sesión</button>
                  </div>
                </>
              ) : (
                <div className="d-flex gap-2 d-sm-none">
                  <Link to="/login" className="btn btn-outline-primary btn-sm">Ingresar</Link>
                  <Link to="/registro" className="btn btn-primary btn-sm">Registrarse</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
