import { Link } from "react-router-dom";
import { BRAND } from "../data/manifest";

export default function Footer() {
  return (
    <footer className="site-footer pt-5 pb-4">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-4">
            <div className="footer-brand d-flex align-items-center gap-2 mb-2"><span className="brand-mark">A</span>{BRAND.name}</div>
            <p className="small mb-0" style={{ maxWidth: "34ch" }}>{BRAND.tagline} Conectamos personas con espacios que sí calzan con su vida.</p>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <h4 className="mb-3">Explorar</h4>
            <ul className="list-unstyled d-grid gap-2 small">
              <li><Link to="/propiedades">Propiedades</Link></li>
              <li><Link to="/categorias">Categorías</Link></li>
              <li><Link to="/ofertas">Ofertas</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <h4 className="mb-3">Cuenta</h4>
            <ul className="list-unstyled d-grid gap-2 small">
              <li><Link to="/login">Iniciar sesión</Link></li>
              <li><Link to="/registro">Registrarse</Link></li>
              <li><Link to="/solicitudes">Mis solicitudes</Link></li>
              <li><Link to="/publicar">Publicar arriendo</Link></li>
            </ul>
          </div>
          <div className="col-12 col-md-4 col-lg-4">
            <h4 className="mb-3">Contacto</h4>
            <ul className="list-unstyled d-grid gap-2 small">
              <li><a href={"mailto:" + BRAND.email}>{BRAND.email}</a></li>
              <li><a href={BRAND.phoneHref}>{BRAND.phone}</a></li>
              <li>{BRAND.address}</li>
            </ul>
          </div>
        </div>
        <div className="border-top border-secondary-subtle pt-3 small">
          © {new Date().getFullYear()} {BRAND.name}. Proyecto académico DSY1104 — Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
