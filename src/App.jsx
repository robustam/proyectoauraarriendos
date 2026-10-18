import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import AdminLayout, { RequireAdmin } from "./components/AdminLayout";

/* ---------- Tienda (público) ---------- */
import Home from "./pages/Home";
import Propiedades from "./pages/Propiedades";
import PropiedadDetalle from "./pages/PropiedadDetalle";
import Categorias from "./pages/Categorias";
import Ofertas from "./pages/Ofertas";
import Nosotros from "./pages/Nosotros";
import Blog from "./pages/Blog";
import BlogDetalle from "./pages/BlogDetalle";
import Contacto from "./pages/Contacto";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Publicar from "./pages/Publicar";
import Solicitudes from "./pages/Solicitudes";
import Checkout from "./pages/Checkout";
import CompraResultado from "./pages/CompraResultado";
import NotFound from "./pages/NotFound";

/* ---------- Panel de administración ---------- */
import Dashboard from "./pages/admin/Dashboard";
import Ordenes from "./pages/admin/Ordenes";
import OrdenDetalle from "./pages/admin/OrdenDetalle";
import AdminPropiedades from "./pages/admin/AdminPropiedades";
import PropiedadAdminDetalle from "./pages/admin/PropiedadAdminDetalle";
import PropiedadForm from "./pages/admin/PropiedadForm";
import StockCritico from "./pages/admin/StockCritico";
import CategoriasAdmin from "./pages/admin/CategoriasAdmin";
import CategoriaForm from "./pages/admin/CategoriaForm";
import Usuarios from "./pages/admin/Usuarios";
import UsuarioDetalle from "./pages/admin/UsuarioDetalle";
import UsuarioForm from "./pages/admin/UsuarioForm";
import AdminBlog from "./pages/admin/AdminBlog";
import BlogForm from "./pages/admin/BlogForm";
import Mensajes from "./pages/admin/Mensajes";
import Visitas from "./pages/admin/Visitas";
import VisitaForm from "./pages/admin/VisitaForm";
import Reportes from "./pages/admin/Reportes";
import Perfil from "./pages/admin/Perfil";

/* Vuelve arriba al cambiar de página (la SPA no recarga). */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const soloAdmin = (el) => <RequireAdmin>{el}</RequireAdmin>;

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="propiedades" element={<Propiedades />} />
          <Route path="propiedades/:id" element={<PropiedadDetalle />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="categorias/:id" element={<Categorias />} />
          <Route path="ofertas" element={<Ofertas />} />
          <Route path="nosotros" element={<Nosotros />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:id" element={<BlogDetalle />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Registro />} />
          <Route path="publicar" element={<Publicar />} />
          <Route path="solicitudes" element={<Solicitudes />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="compra/exito/:id" element={<CompraResultado />} />
          <Route path="compra/error/:id" element={<CompraResultado />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="ordenes" element={<Ordenes />} />
          <Route path="ordenes/:id" element={<OrdenDetalle />} />
          <Route path="propiedades" element={<AdminPropiedades />} />
          <Route path="propiedades/nueva" element={soloAdmin(<PropiedadForm />)} />
          <Route path="propiedades/:id" element={<PropiedadAdminDetalle />} />
          <Route path="propiedades/:id/editar" element={soloAdmin(<PropiedadForm />)} />
          <Route path="stock-critico" element={<StockCritico />} />
          <Route path="categorias" element={soloAdmin(<CategoriasAdmin />)} />
          <Route path="categorias/nueva" element={soloAdmin(<CategoriaForm />)} />
          <Route path="categorias/:id/editar" element={soloAdmin(<CategoriaForm />)} />
          <Route path="visitas" element={<Visitas />} />
          <Route path="visitas/nueva" element={<VisitaForm />} />
          <Route path="visitas/:id/editar" element={<VisitaForm />} />
          <Route path="usuarios" element={soloAdmin(<Usuarios />)} />
          <Route path="usuarios/nuevo" element={soloAdmin(<UsuarioForm />)} />
          <Route path="usuarios/:correo" element={soloAdmin(<UsuarioDetalle />)} />
          <Route path="usuarios/:correo/editar" element={soloAdmin(<UsuarioForm />)} />
          <Route path="blog" element={soloAdmin(<AdminBlog />)} />
          <Route path="blog/nueva" element={soloAdmin(<BlogForm />)} />
          <Route path="blog/:id/editar" element={soloAdmin(<BlogForm />)} />
          <Route path="mensajes" element={soloAdmin(<Mensajes />)} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>
      </Routes>
    </>
  );
}
