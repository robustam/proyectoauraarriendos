/* AuraArriendos — lógica compartida por todas las páginas de admin/:
   protege el acceso (solo Administrador y Agente), pinta el nombre en el
   sidebar, resalta el link activo y oculta lo que el rol Agente no debe ver
   (Usuarios, Blog e Inbox quedan exclusivos del Administrador). */
(function () {
  "use strict";

  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  function guardarAcceso() {
    if (!window.AuraStore) return null;
    var sesion = window.AuraStore.getSesion();
    var esStaff = sesion && (sesion.tipoUsuario === "Administrador" || sesion.tipoUsuario === "Agente");
    if (!esStaff) {
      window.location.href = "../login.html";
      return null;
    }
    return sesion;
  }

  function aplicarRol(sesion) {
    var esAgente = sesion.tipoUsuario === "Agente";
    document.documentElement.classList.toggle("role-agente", esAgente);
    $$("[data-role='admin-only']").forEach(function (el) { el.classList.toggle("hidden", esAgente); });
  }

  function pintarUsuario(sesion) {
    $$("[data-admin-user-name]").forEach(function (el) { el.textContent = sesion.nombre; });
    $$("[data-admin-user-role]").forEach(function (el) { el.textContent = sesion.tipoUsuario; });
    $$("[data-admin-user-initial]").forEach(function (el) { el.textContent = (sesion.nombre || "?").charAt(0).toUpperCase(); });
  }

  /* Muestra "(n)" junto a Inbox cuando hay mensajes de contacto sin leer. */
  function pintarInbox() {
    var n = window.AuraStore.contarMensajesNoLeidos ? window.AuraStore.contarMensajesNoLeidos() : 0;
    $$("[data-inbox-count]").forEach(function (el) { el.textContent = n > 0 ? "(" + n + ")" : ""; });
  }

  function marcarActivo() {
    var here = window.location.pathname.split("/").pop() || "index.html";
    $$(".admin-sidebar a[href]").forEach(function (a) {
      var href = a.getAttribute("href").split("/").pop();
      a.classList.toggle("active", href === here);
    });
  }

  function bindLogout() {
    $$("[data-action='logout']").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        window.AuraStore.cerrarSesion();
        window.location.href = "../login.html";
      });
    });
  }

  /* Se ejecuta de inmediato (no espera DOMContentLoaded): los scripts <script
     defer> corren en orden justo después de parsear el HTML, así que para
     cuando el siguiente <script defer> de la página (admin-*.js) se ejecute,
     window.AuraAdmin.sesion ya debe estar disponible de forma síncrona. Antes
     se coordinaba con un CustomEvent, pero el evento se despachaba y se
     perdía antes de que el script de la página alcanzara a escucharlo. */
  var sesionActual = guardarAcceso();
  if (sesionActual) {
    aplicarRol(sesionActual);
    pintarUsuario(sesionActual);
    pintarInbox();
    marcarActivo();
    bindLogout();
  }

  window.AuraAdmin = { guardarAcceso: guardarAcceso, sesion: sesionActual, pintarInbox: pintarInbox };
})();
