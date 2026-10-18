import { Link } from "react-router-dom";
import { formatFechaLarga } from "../utils/format";

export default function BlogCard({ post, showExcerpt = true }) {
  const href = "/blog/" + encodeURIComponent(post.id);
  return (
    <article className="card blog-card h-100">
      <Link to={href} className="blog-media"><img src={post.imagen} alt={post.titulo} loading="lazy" /></Link>
      <div className="card-body d-flex flex-column gap-2">
        <span className="blog-meta">{formatFechaLarga(post.fecha)}</span>
        <h3 className="h5 mb-0">{post.titulo}</h3>
        {showExcerpt && <p className="text-mute small mb-0">{post.resumen}</p>}
        <Link to={href} className="blog-link mt-auto">Leer artículo</Link>
      </div>
    </article>
  );
}
