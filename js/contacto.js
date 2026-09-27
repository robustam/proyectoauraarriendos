/* AuraArriendos — validación en tiempo real del formulario de contacto.
   Reglas (según pauta): nombre requerido max 100; correo max 100 y solo
   dominios @duoc.cl, @profesor.duoc.cl, @gmail.com; comentario requerido max 500.
   Al enviarse, el mensaje se guarda para que el administrador lo lea en su Inbox. */
(function () {
  "use strict";

  function mount() {
    var form = document.getElementById("contact-form");
    if (!form || !window.AuraValidators) return;
    var V = window.AuraValidators;
    var dominios = (window.__AURA__ && window.__AURA__.correosValidos) || ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

    var nombre = form.querySelector("#c-nombre");
    var correo = form.querySelector("#c-correo");
    var comentario = form.querySelector("#c-comentario");
    var alertBox = form.querySelector("[data-form-alert]");
    var counter = form.querySelector("[data-char-count]");

    function checkNombre() {
      return V.validarCampo(nombre, function (v) { return V.requerido(v) && V.largoEntre(v, 1, 100); }, "Ingresa tu nombre completo (máximo 100 caracteres).");
    }
    function checkCorreo() {
      return V.validarCampo(correo, function (v) { return V.requerido(v) && V.largoEntre(v, 1, 100) && V.esCorreoValido(v, dominios); }, "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com (máximo 100 caracteres).");
    }
    function checkComentario() {
      var ok = V.validarCampo(comentario, function (v) { return V.requerido(v) && V.largoEntre(v, 1, 500); }, "Cuéntanos tu mensaje (máximo 500 caracteres).");
      if (counter) counter.textContent = comentario.value.length + " / 500";
      return ok;
    }

    nombre.addEventListener("input", checkNombre);
    correo.addEventListener("input", checkCorreo);
    comentario.addEventListener("input", checkComentario);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = [checkNombre(), checkCorreo(), checkComentario()].every(Boolean);
      if (!ok) {
        if (alertBox) { alertBox.textContent = "Revisa los campos marcados en rojo antes de enviar."; alertBox.className = "form-alert error"; alertBox.classList.remove("hidden"); }
        return;
      }
      if (window.AuraStore) {
        window.AuraStore.guardarMensaje({
          nombre: nombre.value.trim(),
          correo: correo.value.trim(),
          comentario: comentario.value.trim()
        });
      }
      form.reset();
      if (counter) counter.textContent = "0 / 500";
      [nombre, correo, comentario].forEach(function (el) { V.limpiarError(el); });
      if (alertBox) { alertBox.textContent = "¡Gracias! Recibimos tu mensaje y te responderemos dentro de las próximas 24 horas."; alertBox.className = "form-alert success"; alertBox.classList.remove("hidden"); }
      if (window.AuraToast) window.AuraToast("Mensaje enviado correctamente", "success");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
