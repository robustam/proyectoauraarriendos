/* AuraArriendos — admin/usuario-form.html: alta y edición de usuarios.
   Mismas reglas de validación que el registro público, más el selector de
   tipoUsuario (Administrador/Vendedor/Cliente), exclusivo de esta vista. */
(function () {
  "use strict";

  function getParam(key) { return new URLSearchParams(window.location.search).get(key); }

  function init(sesion) {
    var form = document.getElementById("usuario-form");
    if (!form || !window.AuraStore || !window.AuraValidators || !window.AuraRegiones) return;

    if (sesion.tipoUsuario !== "Administrador") {
      window.location.href = "index.html";
      return;
    }

    var V = window.AuraValidators;
    var dominios = (window.__AURA__ && window.__AURA__.correosValidos) || ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

    var run = form.querySelector("#u-run");
    var nombre = form.querySelector("#u-nombre");
    var apellidos = form.querySelector("#u-apellidos");
    var correo = form.querySelector("#u-correo");
    var fecha = form.querySelector("#u-fecha");
    var tipo = form.querySelector("#u-tipo");
    var region = form.querySelector("#u-region");
    var comuna = form.querySelector("#u-comuna");
    var direccion = form.querySelector("#u-direccion");
    var clave = form.querySelector("#u-clave");
    var alertBox = form.querySelector("[data-form-alert]");
    var heading = document.querySelector("[data-form-heading]");

    var correoOriginal = getParam("correo");
    var editando = !!correoOriginal;
    var usuarioExistente = editando ? window.AuraStore.getUsuarioPorCorreo(correoOriginal) : null;

    if (editando && !usuarioExistente) {
      window.location.href = "usuarios.html";
      return;
    }

    if (heading) heading.textContent = editando ? "Editar usuario" : "Nuevo usuario";
    if (editando) {
      run.value = usuarioExistente.run;
      run.disabled = true;
      nombre.value = usuarioExistente.nombre;
      apellidos.value = usuarioExistente.apellidos;
      correo.value = usuarioExistente.correo;
      fecha.value = usuarioExistente.fechaNacimiento || "";
      tipo.value = usuarioExistente.tipoUsuario;
      direccion.value = usuarioExistente.direccion;
      clave.placeholder = "Dejar en blanco para mantener la actual";
      clave.required = false;
    }

    window.AuraRegiones.enlazar(region, comuna, {
      regionSeleccionada: editando ? usuarioExistente.region : "",
      comunaSeleccionada: editando ? usuarioExistente.comuna : ""
    });

    function checkRun() {
      if (editando) return true;
      return V.validarCampo(run, function (v) {
        var limpio = v.toUpperCase().replace(/[.\-]/g, "");
        return V.largoEntre(limpio, 7, 9) && V.esRunValido(limpio) && !window.AuraStore.getUsuarioPorRun(limpio);
      }, "RUN inválido o ya registrado. Sin puntos ni guion, ej: 19011022K.");
    }
    function checkNombre() { return V.validarCampo(nombre, function (v) { return V.requerido(v) && V.largoEntre(v, 1, 50) && V.esNombrePersona(v); }, "Solo letras, máximo 50 caracteres."); }
    function checkApellidos() { return V.validarCampo(apellidos, function (v) { return V.requerido(v) && V.largoEntre(v, 1, 100) && V.esNombrePersona(v); }, "Solo letras, máximo 100 caracteres."); }
    function checkCorreo() {
      return V.validarCampo(correo, function (v) {
        if (!(V.requerido(v) && V.largoEntre(v, 1, 100) && V.esCorreoValido(v, dominios))) return false;
        var existente = window.AuraStore.getUsuarioPorCorreo(v.trim());
        if (!existente) return true;
        return editando && existente.correo.toLowerCase() === correoOriginal.toLowerCase();
      }, "Correo inválido, ya usado por otro usuario, o dominio no permitido.");
    }
    function checkTipo() { return V.validarCampo(tipo, function (v) { return V.requerido(v); }, "Selecciona un tipo de usuario."); }
    function checkRegion() { return V.validarCampo(region, function (v) { return V.requerido(v); }, "Selecciona una región."); }
    function checkComuna() { return V.validarCampo(comuna, function (v) { return V.requerido(v); }, "Selecciona una comuna."); }
    function checkDireccion() { return V.validarCampo(direccion, function (v) { return V.requerido(v) && V.largoEntre(v, 1, 300); }, "Máximo 300 caracteres."); }
    function checkClave() {
      if (editando && !clave.value) { V.limpiarError(clave); return true; }
      return V.validarCampo(clave, function (v) { return V.requerido(v) && V.largoEntre(v, 4, 10); }, "Entre 4 y 10 caracteres.");
    }

    run.addEventListener("input", checkRun);
    nombre.addEventListener("input", checkNombre);
    apellidos.addEventListener("input", checkApellidos);
    correo.addEventListener("input", checkCorreo);
    tipo.addEventListener("change", checkTipo);
    region.addEventListener("change", function () { checkRegion(); window.setTimeout(checkComuna, 0); });
    comuna.addEventListener("change", checkComuna);
    direccion.addEventListener("input", checkDireccion);
    clave.addEventListener("input", checkClave);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var checks = [checkRun(), checkNombre(), checkApellidos(), checkCorreo(), checkTipo(), checkRegion(), checkComuna(), checkDireccion(), checkClave()];
      if (!checks.every(Boolean)) {
        alertBox.textContent = "Revisa los campos marcados en rojo.";
        alertBox.className = "form-alert error";
        alertBox.classList.remove("hidden");
        return;
      }

      var usuario = {
        run: editando ? usuarioExistente.run : run.value.toUpperCase().replace(/[.\-]/g, ""),
        nombre: nombre.value.trim(),
        apellidos: apellidos.value.trim(),
        correo: correo.value.trim(),
        clave: clave.value ? clave.value : usuarioExistente.clave,
        fechaNacimiento: fecha.value || null,
        tipoUsuario: tipo.value,
        region: region.value,
        comuna: comuna.value,
        direccion: direccion.value.trim()
      };
      window.AuraStore.guardarUsuario(usuario, correoOriginal);
      if (window.AuraToast) window.AuraToast(editando ? "Usuario actualizado" : "Usuario creado", "success");
      window.location.href = "usuarios.html";
    });
  }

  if (window.AuraAdmin && window.AuraAdmin.sesion) init(window.AuraAdmin.sesion);
})();
