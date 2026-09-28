/* AuraArriendos — admin/index.html: panel con métricas generales y una
   vista rápida de publicaciones pendientes de revisión. */
(function () {
  "use strict";

  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function formatPrice(n) { return "$" + Number(n || 0).toLocaleString("es-CL"); }

  function render() {
    if (!window.AuraStore) return;
    var propiedades = window.AuraStore.getPropiedades();
    var usuarios = window.AuraStore.getUsuarios();
    var pendientes = propiedades.filter(function (p) { return p.estado === "pendiente"; });
    /* Igual que la pestaña "Publicadas": aprobadas y visibles (sin las arrendadas). */
    var publicadas = propiedades.filter(function (p) { return p.estado === "publicada" && !p.arrendada; });

    var stats = {
      total: propiedades.length,
      publicadas: publicadas.length,
      pendientes: pendientes.length,
      usuarios: usuarios.length
    };

    Object.keys(stats).forEach(function (key) {
      var el = document.querySelector("[data-stat='" + key + "']");
      if (el) el.textContent = stats[key];
    });

    /* El Agente no tiene acceso a la gestión de usuarios: su tarjeta queda
       solo informativa (sin enlace). Las demás tarjetas abren el listado filtrado. */
    var sesion = window.AuraAdmin && window.AuraAdmin.sesion;
    if (sesion && sesion.tipoUsuario !== "Administrador") {
      var linkUsuarios = document.querySelector("[data-stat-link='usuarios']");
      if (linkUsuarios) linkUsuarios.removeAttribute("href");
    }

    renderInbox();

    var target = document.querySelector("[data-pending-preview]");
    if (!target) return;
    if (!pendientes.length) {
      target.innerHTML = '<div class="empty-state"><p class="glyph">✅</p><h3>Sin publicaciones pendientes</h3><p>Todo al día.</p></div>';
      return;
    }
    target.innerHTML = pendientes.slice(0, 4).map(function (p) {
      var foto = (p.imagenes && p.imagenes[0]) || p.imagen || "";
      return (
        '<div class="request-item">' +
          '<img src="' + (foto.indexOf("data:") === 0 ? foto : "../" + foto) + '" alt="' + escHTML(p.nombre) + '">' +
          '<div><h4>' + escHTML(p.nombre) + '</h4><p class="meta">' + escHTML(p.comuna) + " · " + formatPrice(p.precio) + " / mes · enviado por " + escHTML(p.publicadoPor || "—") + "</p></div>" +
          '<a href="propiedades.html?estado=pendiente" class="btn btn-ghost btn-sm">Revisar</a>' +
        "</div>"
      );
    }).join("");
  }

  function renderInbox() {
    var box = document.querySelector("[data-inbox-preview]");
    if (!box || !window.AuraStore.getMensajes) return;
    var noLeidos = window.AuraStore.getMensajes().filter(function (m) { return !m.leido; });
    if (!noLeidos.length) {
      box.innerHTML = '<div class="empty-state"><p class="glyph">📭</p><h3>Sin mensajes nuevos</h3><p><a href="mensajes.html">Ir al Inbox</a></p></div>';
      return;
    }
    box.innerHTML =
      '<div class="table-wrap"><table class="data-table"><thead><tr><th>Fecha</th><th>Nombre</th><th>Mensaje</th></tr></thead><tbody>' +
      noLeidos.slice(0, 4).map(function (m) {
        var corto = m.comentario.length > 70 ? m.comentario.slice(0, 70) + "…" : m.comentario;
        return "<tr><td>" + new Date(m.fecha).toLocaleDateString("es-CL") + "</td><td><strong>" + escHTML(m.nombre) + "</strong></td><td>" + escHTML(corto) + "</td></tr>";
      }).join("") +
      "</tbody></table></div>" +
      '<a href="mensajes.html" class="btn btn-ghost btn-sm mt-2">Ver todos en el Inbox (' + noLeidos.length + ")</a>";
  }

  if (window.AuraAdmin && window.AuraAdmin.sesion) render();
})();
