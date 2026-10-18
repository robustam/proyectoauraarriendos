import { Link } from "react-router-dom";
import { EmptyState } from "../components/ui";
import useTitle from "../hooks/useTitle";

export default function NotFound() {
  useTitle("Página no encontrada — AuraArriendos");
  return (
    <section className="container section">
      <EmptyState glyph="🧭" title="No encontramos esta página">
        <p>Puede que el enlace esté mal escrito o que la página ya no exista.</p>
        <Link to="/" className="btn btn-primary">Volver al inicio</Link>
      </EmptyState>
    </section>
  );
}
