import { Link, useParams } from "react-router-dom";
import BlogCard from "../components/BlogCard";
import { EmptyState } from "../components/ui";
import * as store from "../services/store";
import { useStoreVersion } from "../hooks/useStore";
import useTitle from "../hooks/useTitle";
import { formatFechaLarga } from "../services/format";

export default function BlogDetalle() {
  useStoreVersion();
  const { id } = useParams();
  const lista = store.getBlog();
  const post = lista.find((b) => b.id === id);
  useTitle(post ? post.titulo + " — Blog AuraArriendos" : "Artículo — Blog AuraArriendos");

  if (!post) {
    return (
      <section className="container section-tight">
        <EmptyState glyph="📝" title={lista.length ? "No encontramos ese artículo" : "Aún no hay publicaciones"}>
          <Link to="/blog" className="btn btn-primary">Volver al blog</Link>
        </EmptyState>
      </section>
    );
  }

  const otros = lista.filter((b) => b.id !== post.id).slice(0, 2);

  return (
    <>
      <article className="container section-tight">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/blog">Blog</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Artículo</li>
          </ol>
        </nav>
        <p className="eyebrow">Noticias importantes</p>
        <h1>{post.titulo}</h1>
        <p className="lede">Por {post.autor} · {formatFechaLarga(post.fecha)}</p>
        <div className="article-media my-4"><img src={post.imagen} alt={post.titulo} /></div>
        <div className="article-body mx-auto">
          {(post.contenido || []).map((parrafo, i) => <p key={i}>{parrafo}</p>)}
        </div>
      </article>

      {otros.length > 0 && (
        <section className="container section-tight border-top">
          <h2 className="h4 mb-3">Otros artículos</h2>
          <div className="row g-4 row-cols-1 row-cols-md-2">
            {otros.map((b) => <div className="col" key={b.id}><BlogCard post={b} showExcerpt={false} /></div>)}
          </div>
        </section>
      )}
    </>
  );
}
