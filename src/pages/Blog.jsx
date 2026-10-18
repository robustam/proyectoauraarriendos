import Reveal from "../components/Reveal";
import BlogCard from "../components/BlogCard";
import { EmptyState } from "../components/ui";
import * as store from "../services/store";
import { useStoreVersion } from "../hooks/useStore";
import useTitle from "../hooks/useTitle";

export default function Blog() {
  useTitle("Blog — AuraArriendos");
  useStoreVersion();
  const posts = store.getBlog();

  return (
    <>
      <Reveal as="section" className="page-hero container">
        <p className="eyebrow">Noticias importantes</p>
        <h1>Guías para arrendar mejor</h1>
        <p className="lede">Ideas prácticas del equipo de AuraArriendos para que tu próximo arriendo — y tu mudanza — sean simples.</p>
      </Reveal>
      <section className="container section-tight pt-0">
        {posts.length ? (
          <div className="row g-4 row-cols-1 row-cols-md-2 row-cols-xl-3">
            {posts.map((b) => <div className="col" key={b.id}><BlogCard post={b} /></div>)}
          </div>
        ) : (
          <EmptyState glyph="📝" title="Aún no hay publicaciones"><p>Vuelve pronto para leer nuestras guías.</p></EmptyState>
        )}
      </section>
    </>
  );
}
