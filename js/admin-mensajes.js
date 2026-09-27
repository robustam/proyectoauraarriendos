/* AuraArriendos — admin/mensajes.html: Inbox con los mensajes enviados desde
   el formulario de contacto del sitio público. Permite filtrarlos, leerlos,
   marcarlos como leídos/no leídos, responder por correo y eliminarlos.
   Solo el rol Administrador puede entrar. */
(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function formatFechaHora(iso) {
    return new Date(iso).toLocaleString("es-CL", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function openModal(id) { var m = document.getElementById(id); if (m) m.classList.add("is-open"); }
  function closeModal(id) { var m = document.getElementById(id); if (m) m.classList.remove("is-open"); }

  function init(sesion) {
    if (sesion.tipoUsuario !== "Administrador") {
      window.location.href = "index.html";
      return;
    }
    var tbody = $("[data-inbox-tbody]");
    var tabsWrap = $("[data-inbox-tabs]");
    var countEl = $("[data-total-count]");
    if (!tbody || !window.AuraStore) return;

    var filtro = "todos";
    var objetivo = null;
    var TABS = [
      { key: "todos", label: "Todos" },
      { key: "nuevos", label: "No leídos" },
      { key: "leidos", label: "Leídos" }
    ];
    tabsWrap.innerHTML = TABS.map(function (t) {
      return '<button type="button" class="admin-tab' + (t.key === filtro ? " is-active" : "") + '" data-tab="' + t.key + '">' + t.label + "</button>";
    }).join("");

    function refrescarContadores() {
      if (window.AuraAdmin && window.AuraAdmin.pintarInbox) window.AuraAdmin.pintarInbox();
    }

    function buscar(id) {
      return window.AuraStore.getMensajes().filter(function (m) { return m.id === id; })[0] || null;
    }

    function render() {
      var lista = window.AuraStore.getMensajes();
      if (filtro === "nuevos") lista = lista.filter(function (m) { return !m.leido; });
      if (filtro === "leidos") lista = lista.filter(function (m) { return m.leido; });
      countEl.textContent = lista.length;

      tbody.innerHTML = lista.map(function (m) {
        var corto = m.comentario.length > 80 ? m.comentario.slice(0, 80) + "…" : m.comentario;
        var peso = m.leido ? "" : "font-weight:700;";
        return (
          "<tr>" +
            '<td><span class="status-pill ' + (m.leido ? "status-publicada" : "status-pendiente") + '">' + (m.leido ? "leído" : "nuevo") + "</span></td>" +
            "<td>" + formatFechaHora(m.fecha) + "</td>" +
            '<td style="' + peso + '">' + escHTML(m.nombre) + "</td>" +
            "<td>" + escHTML(m.correo) + "</td>" +
            '<td style="' + peso + '">' + escHTML(corto) + "</td>" +
            '<td><div class="table-actions">' +
              '<button type="button" class="btn btn-primary btn-sm" data-view-msg="' + m.id + '">Ver</button>' +
              ' <button type="button" class="btn btn-ghost btn-sm" data-toggle-read="' + m.id + '">' + (m.leido ? "Marcar no leído" : "Marcar leído") + "</button>" +
              ' <button type="button" class="btn btn-danger btn-sm" data-delete-msg="' + m.id + '">Eliminar</button>' +
            "</div></td>" +
          "</tr>"
        );
      }).join("") || '<tr><td colspan="6"><div class="empty-state"><p class="glyph">📭</p><h3>No hay mensajes aquí</h3><p>Los mensajes del formulario de contacto aparecerán en esta bandeja.</p></div></td></tr>';

      $$("[data-view-msg]", tbody).forEach(function (btn) {
        btn.addEventListener("click", function () { verMensaje(btn.getAttribute("data-view-msg")); });
      });
      $$("[data-toggle-read]", tbody).forEach(function (btn) {
        btn.addEventListener("click", function () {
          var m = buscar(btn.getAttribute("data-toggle-read"));
          if (!m) return;
          window.AuraStore.marcarMensajeLeido(m.id, !m.leido);
          refrescarContadores();
          render();
        });
      });
      $$("[data-delete-msg]", tbody).forEach(function (btn) {
        btn.addEventListener("click", function () {
          objetivo = btn.getAttribute("data-delete-msg");
          openModal("modal-delete-msg");
        });
      });
    }

    function verMensaje(id) {
      var m = buscar(id);
      if (!m) return;
      $("[data-msg-nombre]").textContent = m.nombre;
      $("[data-msg-meta]").textContent = m.correo + " · " + formatFechaHora(m.fecha);
      $("[data-msg-texto]").textContent = m.comentario;
      $("[data-reply-msg]").setAttribute("href", "mailto:" + encodeURIComponent(m.correo) + "?subject=" + encodeURIComponent("Re: tu mensaje a AuraArriendos"));
      openModal("modal-view-msg");
      if (!m.leido) {
        window.AuraStore.marcarMensajeLeido(m.id, true);
        refrescarContadores();
        render();
      }
    }

    $$("[data-tab]", tabsWrap).forEach(function (btn) {
      btn.addEventListener("click", function () {
        filtro = btn.getAttribute("data-tab");
        $$("[data-tab]", tabsWrap).forEach(function (b) { b.classList.toggle("is-active", b === btn); });
        render();
      });
    });

    var cerrar = $("[data-close-msg]");
    if (cerrar) cerrar.addEventListener("click", function () { closeModal("modal-view-msg"); });

    var confirmar = $("[data-confirm-delete-msg]");
    if (confirmar) {
      confirmar.addEventListener("click", function () {
        window.AuraStore.eliminarMensaje(objetivo);
        closeModal("modal-delete-msg");
        refrescarContadores();
        if (window.AuraToast) window.AuraToast("Mensaje eliminado", "error");
        render();
      });
    }
    var cancelar = $("[data-cancel-delete-msg]");
    if (cancelar) cancelar.addEventListener("click", function () { closeModal("modal-delete-msg"); });

    render();
  }

  if (window.AuraAdmin && window.AuraAdmin.sesion) init(window.AuraAdmin.sesion);
})();
