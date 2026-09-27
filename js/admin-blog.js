/* AuraArriendos — admin/blog.html: listado de publicaciones del blog con
   acciones Ver, Editar y Eliminar. Solo el rol Administrador puede entrar. */
(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function rutaImagen(src) { return String(src || "").indexOf("data:") === 0 ? src : "../" + src; }
  function formatFecha(f) { return new Date(f + "T12:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" }); }

  function openModal(id) { var m = document.getElementById(id); if (m) m.classList.add("is-open"); }
  function closeModal(id) { var m = document.getElementById(id); if (m) m.classList.remove("is-open"); }

  function init(sesion) {
    if (sesion.tipoUsuario !== "Administrador") {
      window.location.href = "index.html";
      return;
    }
    var tbody = $("[data-blog-tbody]");
    var countEl = $("[data-total-count]");
    if (!tbody || !window.AuraStore) return;

    var objetivo = null;

    function render() {
      var lista = window.AuraStore.getBlog();
      countEl.textContent = lista.length;

      tbody.innerHTML = lista.map(function (b) {
        return (
          "<tr>" +
            '<td><img src="' + rutaImagen(b.imagen) + '" class="table-thumb" alt=""></td>' +
            "<td><strong>" + escHTML(b.titulo) + '</strong><br><span style="font-size:.78rem;color:var(--ink-mute)">' + escHTML(b.resumen) + "</span></td>" +
            "<td>" + formatFecha(b.fecha) + "</td>" +
            "<td>" + escHTML(b.autor) + "</td>" +
            '<td><div class="table-actions">' +
              '<a href="../blog-detalle.html?id=' + encodeURIComponent(b.id) + '" class="btn btn-ghost btn-sm" target="_blank">Ver</a>' +
              ' <a href="blog-form.html?id=' + encodeURIComponent(b.id) + '" class="btn btn-ghost btn-sm">Editar</a>' +
              ' <button type="button" class="btn btn-danger btn-sm" data-delete-post="' + escHTML(b.id) + '">Eliminar</button>' +
            "</div></td>" +
          "</tr>"
        );
      }).join("") || '<tr><td colspan="5"><div class="empty-state"><p class="glyph">📝</p><h3>Aún no hay publicaciones</h3><p>Crea la primera con “+ Nueva publicación”.</p></div></td></tr>';

      $$("[data-delete-post]", tbody).forEach(function (btn) {
        btn.addEventListener("click", function () {
          objetivo = btn.getAttribute("data-delete-post");
          openModal("modal-delete-post");
        });
      });
    }

    var confirmar = $("[data-confirm-delete-post]");
    if (confirmar) {
      confirmar.addEventListener("click", function () {
        window.AuraStore.eliminarPost(objetivo);
        closeModal("modal-delete-post");
        if (window.AuraToast) window.AuraToast("Publicación eliminada", "error");
        render();
      });
    }
    var cancelar = $("[data-cancel-delete-post]");
    if (cancelar) cancelar.addEventListener("click", function () { closeModal("modal-delete-post"); });

    render();
  }

  if (window.AuraAdmin && window.AuraAdmin.sesion) init(window.AuraAdmin.sesion);
})();
