/* AuraArriendos — "Mis solicitudes" es el equivalente al carrito de compras
   exigido por la pauta: arreglo en JS + persistencia en localStorage
   (ver AuraStore). Aquí solo se pinta la lista y se gestionan sus acciones. */
(function () {
  "use strict";

  function formatPrice(n) { return "$" + Number(n || 0).toLocaleString("es-CL"); }
  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function mount() {
    var listTarget = document.querySelector("[data-request-list]");
    if (!listTarget || !window.AuraStore) return;
    var emptyState = document.querySelector("[data-request-empty]");
    var summaryWrap = document.querySelector("[data-request-summary]");
    var sendBtn = document.querySelector("[data-send-requests]");

    function render() {
      var ids = window.AuraStore.getSolicitudes();
      var propiedades = ids.map(function (id) { return window.AuraStore.getPropiedadPorId(id); }).filter(Boolean);

      if (!propiedades.length) {
        listTarget.innerHTML = "";
        if (emptyState) emptyState.classList.remove("hidden");
        if (summaryWrap) summaryWrap.classList.add("hidden");
        return;
      }

      if (emptyState) emptyState.classList.add("hidden");
      if (summaryWrap) summaryWrap.classList.remove("hidden");

      listTarget.innerHTML = propiedades.map(function (p) {
        return (
          '<div class="request-item">' +
            '<img src="' + p.imagen + '" alt="' + escHTML(p.nombre) + '">' +
            '<div><h4>' + escHTML(p.nombre) + '</h4><p class="meta">' + escHTML(p.comuna) + " · " + formatPrice(p.precio) + " / mes</p>" +
              (p.arrendada ? '<p class="meta" style="color:var(--danger)">Ya fue arrendada, por ahora no está disponible.</p>' : "") +
            "</div>" +
            '<button type="button" class="btn btn-ghost btn-sm" data-remove-request="' + p.id + '">Quitar</button>' +
          "</div>"
        );
      }).join("");

      var total = propiedades.reduce(function (acc, p) { return acc + Number(p.precio || 0); }, 0);
      var promedio = Math.round(total / propiedades.length);
      if (summaryWrap) {
        summaryWrap.querySelector("[data-summary-count]").textContent = propiedades.length;
        summaryWrap.querySelector("[data-summary-total]").textContent = formatPrice(total);
        summaryWrap.querySelector("[data-summary-avg]").textContent = formatPrice(promedio);
      }

      Array.prototype.slice.call(listTarget.querySelectorAll("[data-remove-request]")).forEach(function (btn) {
        btn.addEventListener("click", function () {
          window.AuraStore.quitarSolicitud(btn.getAttribute("data-remove-request"));
          if (window.AuraUpdateRequestBadge) window.AuraUpdateRequestBadge();
          render();
        });
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener("click", function () {
        if (!window.AuraStore.getSolicitudes().length) return;
        if (!window.AuraRequireLogin()) return;
        window.AuraStore.vaciarSolicitudes();
        if (window.AuraUpdateRequestBadge) window.AuraUpdateRequestBadge();
        render();
        if (window.AuraToast) window.AuraToast("Enviamos tu interés a los arrendadores. Te contactarán a la brevedad.", "success");
      });
    }

    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
