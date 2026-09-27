/* AuraArriendos — admin/usuarios.html: listado de usuarios y eliminación.
   Ruta accesible solo para Administrador (Agente y Cliente son redirigidos). */
(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function init(sesion) {
    var tbody = $("[data-users-tbody]");
    if (!tbody || !window.AuraStore) return;

    if (sesion.tipoUsuario !== "Administrador") {
      window.location.href = "index.html";
      return;
    }

    var countEl = $("[data-total-count]");
    var objetivo = null;

    function render() {
      var lista = window.AuraStore.getUsuarios();
      if (countEl) countEl.textContent = lista.length;
      tbody.innerHTML = lista.map(function (u) {
        return (
          "<tr>" +
            "<td><strong>" + escHTML(u.nombre) + " " + escHTML(u.apellidos) + "</strong></td>" +
            "<td>" + escHTML(u.correo) + "</td>" +
            "<td>" + escHTML(u.run) + "</td>" +
            "<td><span class=\"chip\">" + escHTML(u.tipoUsuario) + "</span></td>" +
            "<td>" + escHTML(u.comuna || "—") + "</td>" +
            '<td><div class="table-actions">' +
              '<a href="usuario-form.html?correo=' + encodeURIComponent(u.correo) + '" class="btn btn-ghost btn-sm">Editar</a>' +
              (u.correo === sesion.correo ? "" : '<button type="button" class="btn btn-danger btn-sm" data-delete-user="' + escHTML(u.correo) + '">Eliminar</button>') +
            "</div></td>" +
          "</tr>"
        );
      }).join("") || "<tr><td colspan=\"6\"><div class=\"empty-state\"><p class=\"glyph\">👤</p><h3>No hay usuarios registrados</h3></div></td></tr>";

      $$("[data-delete-user]", tbody).forEach(function (btn) {
        btn.addEventListener("click", function () {
          objetivo = btn.getAttribute("data-delete-user");
          document.getElementById("modal-delete-user").classList.add("is-open");
        });
      });
    }

    var confirmBtn = $("[data-confirm-delete-user]");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", function () {
        window.AuraStore.eliminarUsuario(objetivo);
        document.getElementById("modal-delete-user").classList.remove("is-open");
        if (window.AuraToast) window.AuraToast("Usuario eliminado", "error");
        render();
      });
    }
    var cancelBtn = $("[data-cancel-delete-user]");
    if (cancelBtn) cancelBtn.addEventListener("click", function () { document.getElementById("modal-delete-user").classList.remove("is-open"); });

    render();
  }

  if (window.AuraAdmin && window.AuraAdmin.sesion) init(window.AuraAdmin.sesion);
})();
