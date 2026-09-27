/* AuraArriendos — render de blog-detalle.html a partir de ?id= */
(function () {
  "use strict";

  function getParam(key) { return new URLSearchParams(window.location.search).get(key); }
  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function mount() {
    var target = document.querySelector("[data-article]");
    if (!target) return;
    var lista = window.AuraStore ? window.AuraStore.getBlog() : ((window.__AURA__ && window.__AURA__.blog) || []);
    if (!lista.length) {
      target.innerHTML = '<div class="empty-state"><p class="glyph">📝</p><h3>Aún no hay publicaciones</h3><a href="blog.html" class="btn btn-primary mt-2">Volver al blog</a></div>';
      return;
    }
    var id = getParam("id");
    var post = lista.filter(function (b) { return b.id === id; })[0] || lista[0];
    if (!post) return;

    document.title = post.titulo + " — Blog AuraArriendos";

    target.innerHTML =
      '<p class="eyebrow article-kicker">Noticias importantes</p>' +
      '<h1>' + escHTML(post.titulo) + "</h1>" +
      '<p class="lede">Por ' + escHTML(post.autor) + " · " + new Date(post.fecha + "T12:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" }) + "</p>" +
      '<div class="article-media"><img src="' + post.imagen + '" alt="' + escHTML(post.titulo) + '"></div>' +
      '<div class="article-body">' + post.contenido.map(function (p) { return "<p>" + escHTML(p) + "</p>"; }).join("") + "</div>";

    var relatedTarget = document.querySelector("[data-related-posts]");
    if (relatedTarget) {
      var otros = lista.filter(function (b) { return b.id !== post.id; }).slice(0, 2);
      relatedTarget.innerHTML = otros.map(function (b) {
        return (
          '<article class="blog-card">' +
            '<a href="blog-detalle.html?id=' + b.id + '" class="blog-media"><img src="' + b.imagen + '" alt="' + escHTML(b.titulo) + '" loading="lazy"></a>' +
            '<div class="blog-body">' +
              '<span class="blog-meta">' + new Date(b.fecha + "T12:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" }) + "</span>" +
              '<h3 class="blog-title">' + escHTML(b.titulo) + "</h3>" +
              '<a href="blog-detalle.html?id=' + b.id + '" class="blog-link">Leer artículo</a>' +
            "</div>" +
          "</article>"
        );
      }).join("");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
