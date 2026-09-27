/* AuraArriendos — login.html y registro.html.
   Reglas de la pauta:
   - Login: correo requerido max 100, dominios permitidos; contraseña requerida 4-10 caracteres.
   - Registro = alta de usuario (mismas reglas que "nuevo usuario" del admin):
     RUN válido (módulo 11, sin puntos ni guion, 7-9 caracteres), nombre req. max 50,
     apellidos req. max 100, correo req. max 100 con dominio permitido, fecha de
     nacimiento opcional, dirección req. max 300. Contraseña usa el mismo rango 4-10. */
(function () {
  "use strict";

  function dominios() { return (window.__AURA__ && window.__AURA__.correosValidos) || ["duoc.cl", "profesor.duoc.cl", "gmail.com"]; }

  function mountLogin() {
    var form = document.getElementById("login-form");
    if (!form || !window.AuraValidators || !window.AuraStore) return;
    var V = window.AuraValidators;
    var correo = form.querySelector("#l-correo");
    var clave = form.querySelector("#l-clave");
    var alertBox = form.querySelector("[data-form-alert]");

    function checkCorreo() {
      return V.validarCampo(correo, function (v) { return V.requerido(v) && V.largoEntre(v, 1, 100) && V.esCorreoValido(v, dominios()); }, "Correo inválido. Usa @duoc.cl, @profesor.duoc.cl o @gmail.com.");
    }
    function checkClave() {
      return V.validarCampo(clave, function (v) { return V.requerido(v) && V.largoEntre(v, 4, 10); }, "La contraseña debe tener entre 4 y 10 caracteres.");
    }

    correo.addEventListener("input", checkCorreo);
    clave.addEventListener("input", checkClave);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = [checkCorreo(), checkClave()].every(Boolean);
      if (!ok) return;

      var usuario = window.AuraStore.getUsuarioPorCorreo(correo.value.trim());
      if (!usuario || usuario.clave !== clave.value) {
        if (alertBox) { alertBox.textContent = "Correo o contraseña incorrectos."; alertBox.className = "form-alert error"; alertBox.classList.remove("hidden"); }
        return;
      }

      window.AuraStore.iniciarSesion(usuario);
      var destino = (usuario.tipoUsuario === "Administrador" || usuario.tipoUsuario === "Vendedor") ? "admin/index.html" : "index.html";
      window.location.href = destino;
    });
  }

  function mountRegistro() {
    var form = document.getElementById("registro-form");
    if (!form || !window.AuraValidators || !window.AuraStore || !window.AuraRegiones) return;
    var V = window.AuraValidators;

    var run = form.querySelector("#r-run");
    var nombre = form.querySelector("#r-nombre");
    var apellidos = form.querySelector("#r-apellidos");
    var correo = form.querySelector("#r-correo");
    var fecha = form.querySelector("#r-fecha");
    var region = form.querySelector("#r-region");
    var comuna = form.querySelector("#r-comuna");
    var direccion = form.querySelector("#r-direccion");
    var clave = form.querySelector("#r-clave");
    var claveConfirmar = form.querySelector("#r-clave-confirmar");
    var alertBox = form.querySelector("[data-form-alert]");

    window.AuraRegiones.enlazar(region, comuna, {});

    function checkRun() {
      return V.validarCampo(run, function (v) {
        var limpio = v.toUpperCase().replace(/[.\-]/g, "");
        return V.largoEntre(limpio, 7, 9) && V.esRunValido(limpio);
      }, "RUN inválido. Ingresa sin puntos ni guion, ej: 19011022K.");
    }
    function checkNombre() {
      return V.validarCampo(nombre, function (v) { return V.requerido(v) && V.largoEntre(v, 1, 50); }, "Ingresa tu nombre (máximo 50 caracteres).");
    }
    function checkApellidos() {
      return V.validarCampo(apellidos, function (v) { return V.requerido(v) && V.largoEntre(v, 1, 100); }, "Ingresa tus apellidos (máximo 100 caracteres).");
    }
    function checkCorreo() {
      return V.validarCampo(correo, function (v) {
        if (!(V.requerido(v) && V.largoEntre(v, 1, 100) && V.esCorreoValido(v, dominios()))) return false;
        var existente = window.AuraStore.getUsuarioPorCorreo(v.trim());
        return !existente;
      }, "Correo inválido, ya registrado, o con dominio no permitido (@duoc.cl, @profesor.duoc.cl, @gmail.com).");
    }
    function checkRegion() {
      return V.validarCampo(region, function (v) { return V.requerido(v); }, "Selecciona tu región.");
    }
    function checkComuna() {
      return V.validarCampo(comuna, function (v) { return V.requerido(v); }, "Selecciona tu comuna.");
    }
    function checkDireccion() {
      return V.validarCampo(direccion, function (v) { return V.requerido(v) && V.largoEntre(v, 1, 300); }, "Ingresa tu dirección (máximo 300 caracteres).");
    }
    function checkClave() {
      return V.validarCampo(clave, function (v) { return V.requerido(v) && V.largoEntre(v, 4, 10); }, "La contraseña debe tener entre 4 y 10 caracteres.");
    }
    function checkClaveConfirmar() {
      return V.validarCampo(claveConfirmar, function (v) { return V.requerido(v) && v === clave.value; }, "Las contraseñas no coinciden.");
    }

    run.addEventListener("input", checkRun);
    nombre.addEventListener("input", checkNombre);
    apellidos.addEventListener("input", checkApellidos);
    correo.addEventListener("input", checkCorreo);
    region.addEventListener("change", function () { checkRegion(); window.setTimeout(checkComuna, 0); });
    comuna.addEventListener("change", checkComuna);
    direccion.addEventListener("input", checkDireccion);
    clave.addEventListener("input", function () { checkClave(); if (claveConfirmar.value) checkClaveConfirmar(); });
    claveConfirmar.addEventListener("input", checkClaveConfirmar);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var checks = [checkRun(), checkNombre(), checkApellidos(), checkCorreo(), checkRegion(), checkComuna(), checkDireccion(), checkClave(), checkClaveConfirmar()];
      if (!checks.every(Boolean)) {
        if (alertBox) { alertBox.textContent = "Revisa los campos marcados en rojo."; alertBox.className = "form-alert error"; alertBox.classList.remove("hidden"); }
        return;
      }

      var nuevoUsuario = {
        run: run.value.toUpperCase().replace(/[.\-]/g, ""),
        nombre: nombre.value.trim(),
        apellidos: apellidos.value.trim(),
        correo: correo.value.trim(),
        clave: clave.value,
        fechaNacimiento: fecha.value || null,
        tipoUsuario: "Cliente",
        region: region.value,
        comuna: comuna.value,
        direccion: direccion.value.trim()
      };
      window.AuraStore.guardarUsuario(nuevoUsuario);
      window.AuraStore.iniciarSesion(nuevoUsuario);
      if (window.AuraToast) window.AuraToast("Cuenta creada. ¡Bienvenido/a a AuraArriendos!", "success");
      window.location.href = "index.html";
    });
  }

  function boot() {
    mountLogin();
    mountRegistro();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
