/* AuraArriendos — admin/propiedades.html: listado, filtro por estado,
   aprobación/rechazo de publicaciones enviadas por arrendadores, y
   eliminación. También permite marcar una propiedad como arrendada (se oculta
   del sitio público) y reactivarla. Administrador y Agente pueden aprobar,
   rechazar y marcar arrendada; editar, eliminar y crear son solo Administrador. */
(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function formatPrice(n) { return "$" + Number(n || 0).toLocaleString("es-CL"); }

  function openModal(id) { var m = document.getElementById(id); if (m) m.classList.add("is-open"); }
  function closeModal(id) { var m = document.getElementById(id); if (m) m.classList.remove("is-open"); }

  function init(sesion) {
    var tbody = $("[data-properties-tbody]");
    if (!tbody || !window.AuraStore) return;
    var esAdmin = sesion.tipoUsuario === "Administrador";
    var esAgente = sesion.tipoUsuario === "Agente";
    var puedeGestionarSolicitudes = esAdmin || esAgente;
    var tabsWrap = $("[data-status-tabs]");
    var countEl = $("[data-total-count]");
    var params = new URLSearchParams(window.location.search);
    var estadoActivo = params.get("estado") || "todas";

    var TABS = [
      { key: "todas", label: "Todas" },
      { key: "publicada", label: "Publicadas" },
      { key: "pendiente", label: "Pendientes" },
      { key: "rechazada", label: "Rechazadas" },
      { key: "arrendada", label: "Arrendadas" }
    ];
    tabsWrap.innerHTML = TABS.map(function (t) {
      return '<button type="button" class="admin-tab' + (t.key === estadoActivo ? " is-active" : "") + '" data-tab="' + t.key + '">' + t.label + "</button>";
    }).join("");

    var pendienteObjetivo = null;

    function render() {
      var lista = window.AuraStore.getPropiedades();
      if (estadoActivo === "arrendada") {
        lista = lista.filter(function (p) { return !!p.arrendada; });
      } else if (estadoActivo === "publicada") {
        lista = lista.filter(function (p) { return p.estado === "publicada" && !p.arrendada; });
      } else if (estadoActivo !== "todas") {
        lista = lista.filter(function (p) { return p.estado === estadoActivo; });
      }
      lista = lista.slice().sort(function (a, b) { return a.estado === "pendiente" ? -1 : 1; });

      countEl.textContent = lista.length;

      tbody.innerHTML = lista.map(function (p) {
        var acciones = '<a href="../propiedad-detalle.html?id=' + p.id + '" class="btn btn-ghost btn-sm" target="_blank">Ver</a>';
        if (esAdmin) {
          acciones += ' <a href="propiedad-form.html?id=' + p.id + '" class="btn btn-ghost btn-sm">Editar</a>';
        }
        if (puedeGestionarSolicitudes) {
          if (p.estado === "pendiente") {
            acciones += ' <button type="button" class="btn btn-primary btn-sm" data-approve="' + p.id + '">Aprobar</button>';
            acciones += ' <button type="button" class="btn btn-danger btn-sm" data-reject="' + p.id + '">Rechazar</button>';
          }
          if (p.estado === "publicada") {
            acciones += p.arrendada
              ? ' <button type="button" class="btn btn-primary btn-sm" data-arrendar="' + p.id + '" data-valor="no">Reactivar</button>'
              : ' <button type="button" class="btn btn-ghost btn-sm" data-arrendar="' + p.id + '" data-valor="si">Marcar arrendada</button>';
          }
        }
        if (esAdmin) {
          acciones += ' <button type="button" class="btn btn-danger btn-sm" data-delete="' + p.id + '">Eliminar</button>';
        }
        return (
          "<tr>" +
           // CÓDIGO NUEVO (Obtiene la primera imagen de la lista)
            '<td><img src="' + (Array.isArray(p.imagenes) ? (p.imagenes[0].indexOf("data:") === 0 ? p.imagenes[0] : "../" + p.imagenes[0]) : p.imagen) + '" class="table-thumb" alt=""></td>' +
            "<td><strong>" + escHTML(p.nombre) + "</strong><br><span style=\"font-size:.78rem;color:var(--ink-mute)\">" + escHTML(p.codigo) + "</span></td>" +
            "<td>" + escHTML(p.categoria) + "</td>" +
            "<td>" + escHTML(p.comuna) + "</td>" +
            "<td>" + formatPrice(p.precio) + "</td>" +
            "<td><span class=\"status-pill status-" + (p.arrendada ? "arrendada" : p.estado) + "\">" + (p.arrendada ? "arrendada" : p.estado) + "</span></td>" +
            '<td><div class="table-actions">' + acciones + "</div></td>" +
          "</tr>"
        );
      }).join("") || "<tr><td colspan=\"7\"><div class=\"empty-state\"><p class=\"glyph\">🏘️</p><h3>No hay propiedades en este estado</h3></div></td></tr>";

      $$("[data-approve]", tbody).forEach(function (btn) {
        btn.addEventListener("click", function () {
          var p = window.AuraStore.getPropiedadPorId(btn.getAttribute("data-approve"));
          if (!p) return;
          p.estado = "publicada";
          delete p.motivoRechazo;
          window.AuraStore.guardarPropiedad(p);
          if (window.AuraToast) window.AuraToast("Publicación aprobada", "success");
          render();
        });
      });
      $$("[data-arrendar]", tbody).forEach(function (btn) {
        btn.addEventListener("click", function () {
          var arrendar = btn.getAttribute("data-valor") === "si";
          window.AuraStore.marcarArrendada(btn.getAttribute("data-arrendar"), arrendar);
          if (window.AuraToast) window.AuraToast(arrendar ? "Marcada como arrendada: oculta del sitio público" : "Propiedad visible nuevamente en el sitio", "success");
          render();
        });
      });
      $$("[data-reject]", tbody).forEach(function (btn) {
        btn.addEventListener("click", function () {
          pendienteObjetivo = btn.getAttribute("data-reject");
          $("#reject-reason").value = "";
          openModal("modal-reject");
        });
      });
      $$("[data-delete]", tbody).forEach(function (btn) {
        btn.addEventListener("click", function () {
          pendienteObjetivo = btn.getAttribute("data-delete");
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

    var rejectForm = $("#modal-reject form");
    if (rejectForm) {
      rejectForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var p = window.AuraStore.getPropiedadPorId(pendienteObjetivo);
        if (p) {
          p.estado = "rechazada";
          p.motivoRechazo = $("#reject-reason").value.trim() || "No especificado.";
          window.AuraStore.guardarPropiedad(p);
          if (window.AuraToast) window.AuraToast("Publicación rechazada", "error");
        }
        closeModal("modal-reject");
        render();
      });
    }
    var cancelReject = $("[data-cancel-reject]");
    if (cancelReject) cancelReject.addEventListener("click", function () { closeModal("modal-reject"); });

    var confirmDelete = $("[data-confirm-delete]");
    if (confirmDelete) {
      confirmDelete.addEventListener("click", function () {
        window.AuraStore.eliminarPropiedad(pendienteObjetivo);
        closeModal("modal-delete");
        if (window.AuraToast) window.AuraToast("Propiedad eliminada", "error");
        render();
      });
    }
    var cancelDelete = $("[data-cancel-delete]");
    if (cancelDelete) cancelDelete.addEventListener("click", function () { closeModal("modal-delete"); });

    render();
  }

  if (window.AuraAdmin && window.AuraAdmin.sesion) init(window.AuraAdmin.sesion);
})();
