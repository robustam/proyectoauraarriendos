/* AuraArriendos — admin/visitas.html: listado de visitas al inmueble y
   entregas al cierre del arriendo. Administrador y Agente pueden gestionar
   ambos tipos por completo (crear, cambiar de estado, eliminar). */
(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function formatFecha(t) {
    if (!t.fecha) return "—";
    var f = new Date(t.fecha + "T00:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
    return t.hora ? f + " · " + t.hora : f;
  }

  function openModal(id) { var m = document.getElementById(id); if (m) m.classList.add("is-open"); }
  function closeModal(id) { var m = document.getElementById(id); if (m) m.classList.remove("is-open"); }

  function init() {
    var tbody = $("[data-tramites-tbody]");
    if (!tbody || !window.AuraStore) return;

    var tabsWrap = $("[data-status-tabs]");
    var countEl = $("[data-total-count]");
    var estadoActivo = "todas";
    var objetivoEliminar = null;

    var TABS = [
      { key: "todas", label: "Todas" },
      { key: "visita", label: "Visitas" },
      { key: "entrega", label: "Entregas" }
    ];
    tabsWrap.innerHTML = TABS.map(function (t) {
      return '<button type="button" class="admin-tab' + (t.key === estadoActivo ? " is-active" : "") + '" data-tab="' + t.key + '">' + t.label + "</button>";
    }).join("");

    function render() {
      var lista = window.AuraStore.getTramites();
      if (estadoActivo !== "todas") lista = lista.filter(function (t) { return t.tipo === estadoActivo; });
      countEl.textContent = lista.length;

      tbody.innerHTML = lista.map(function (t) {
        var acciones = '<a href="visita-form.html?id=' + t.id + '" class="btn btn-ghost btn-sm">Editar</a>';
        if (t.tipo === "visita" && t.estado === "Agendada") {
          acciones += ' <button type="button" class="btn btn-primary btn-sm" data-set-estado="' + t.id + '" data-valor="Realizada">Marcar realizada</button>';
          acciones += ' <button type="button" class="btn btn-danger btn-sm" data-set-estado="' + t.id + '" data-valor="Cancelada">Cancelar</button>';
        }
        if (t.tipo === "entrega" && t.estado === "Pendiente") {
          acciones += ' <button type="button" class="btn btn-primary btn-sm" data-set-estado="' + t.id + '" data-valor="Entregado">Confirmar entrega</button>';
        }
        acciones += ' <button type="button" class="btn btn-danger btn-sm" data-delete="' + t.id + '">Eliminar</button>';

        return (
          "<tr>" +
            "<td>" + (t.tipo === "visita" ? "🔑 Visita" : "📦 Entrega") + "</td>" +
            "<td>" + escHTML(t.propiedadNombre || t.propiedadId) + "</td>" +
            "<td>" + escHTML(t.clienteNombre || t.clienteCorreo) + "</td>" +
            "<td>" + escHTML(t.propietarioNombre || t.propietarioCorreo || "No especificado") + "</td>" +
            "<td>" + formatFecha(t) + "</td>" +
            "<td><span class=\"status-pill status-" + String(t.estado || "").toLowerCase() + "\">" + escHTML(t.estado) + "</span></td>" +
            '<td><div class="table-actions">' + acciones + "</div></td>" +
          "</tr>"
        );
      }).join("") || "<tr><td colspan=\"7\"><div class=\"empty-state\"><p class=\"glyph\">📅</p><h3>No hay registros en esta categoría</h3></div></td></tr>";

      $$("[data-set-estado]", tbody).forEach(function (btn) {
        btn.addEventListener("click", function () {
          var t = window.AuraStore.getTramitePorId(btn.getAttribute("data-set-estado"));
          if (!t) return;
          t.estado = btn.getAttribute("data-valor");
          window.AuraStore.guardarTramite(t);
          if (window.AuraToast) {
            var msg = t.tipo === "entrega" && t.estado === "Entregado"
              ? "Entrega confirmada. La propiedad quedó marcada como arrendada."
              : "Estado actualizado";
            window.AuraToast(msg, "success");
          }
          render();
        });
      });
      $$("[data-delete]", tbody).forEach(function (btn) {
        btn.addEventListener("click", function () {
          objetivoEliminar = btn.getAttribute("data-delete");
          openModal("modal-delete");
        });
      });
    }

    $$("[data-tab]", tabsWrap).forEach(function (btn) {
      btn.addEventListener("click", function () {
        estadoActivo = btn.getAttribute("data-tab");
        $$("[data-tab]", tabsWrap).forEach(function (b) { b.classList.toggle("is-active", b === btn); });
        render();
      });
    });

    var confirmDelete = $("[data-confirm-delete]");
    if (confirmDelete) {
      confirmDelete.addEventListener("click", function () {
        window.AuraStore.eliminarTramite(objetivoEliminar);
        closeModal("modal-delete");
        if (window.AuraToast) window.AuraToast("Registro eliminado", "error");
        render();
      });
    }
    var cancelDelete = $("[data-cancel-delete]");
    if (cancelDelete) cancelDelete.addEventListener("click", function () { closeModal("modal-delete"); });

    render();
  }

  if (window.AuraAdmin && window.AuraAdmin.sesion) init();
})();
