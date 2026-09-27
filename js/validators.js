/* AuraArriendos — utilidades de validación reutilizables en todos los formularios.
   window.AuraValidators expone funciones puras (retornan true/false o un mensaje)
   más un par de helpers de UI para mostrar/limpiar errores bajo cada campo. */
(function () {
  "use strict";

  function soloDigitos(str) {
    return /^[0-9]+$/.test(String(str || ""));
  }

  function requerido(valor) {
    return String(valor == null ? "" : valor).trim().length > 0;
  }

  function largoEntre(valor, min, max) {
    var len = String(valor == null ? "" : valor).trim().length;
    if (min != null && len < min) return false;
    if (max != null && len > max) return false;
    return true;
  }

  function esCorreoValido(correo, dominiosPermitidos) {
    var v = String(correo || "").trim();
    var patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!patron.test(v)) return false;
    if (!dominiosPermitidos || !dominiosPermitidos.length) return true;
    var dominio = v.split("@")[1].toLowerCase();
    return dominiosPermitidos.indexOf(dominio) !== -1;
  }

  /* Validación de RUT chileno, módulo 11. Formato esperado sin puntos ni
     guion, ej: 19011022K (7 a 9 caracteres, el último es el dígito verificador). */
  function esRunValido(run) {
    var v = String(run || "").trim().toUpperCase();
    if (v.length < 7 || v.length > 9) return false;
    if (!/^[0-9]+[0-9K]$/.test(v)) return false;

    var cuerpo = v.slice(0, -1);
    var dv = v.slice(-1);
    if (!soloDigitos(cuerpo)) return false;

    var suma = 0;
    var multiplo = 2;
    for (var i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }
    var resto = 11 - (suma % 11);
    var dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
    return dvEsperado === dv;
  }

  function esNumero(valor) {
    return valor !== "" && valor != null && !isNaN(Number(valor));
  }

  function esEntero(valor) {
    return esNumero(valor) && Number.isInteger(Number(valor));
  }

  function numeroEntre(valor, min, max) {
    if (!esNumero(valor)) return false;
    var n = Number(valor);
    if (min != null && n < min) return false;
    if (max != null && n > max) return false;
    return true;
  }

  /* ---------- Helpers de UI: mensajes de error bajo cada campo ---------- */

  function campoContenedor(input) {
    return input.closest(".form-field") || input.parentElement;
  }

  function mostrarError(input, mensaje) {
    var contenedor = campoContenedor(input);
    if (!contenedor) return;
    var errorEl = contenedor.querySelector(".form-error");
    if (!errorEl) {
      errorEl = document.createElement("p");
      errorEl.className = "form-error";
      errorEl.setAttribute("role", "alert");
      contenedor.appendChild(errorEl);
    }
    errorEl.textContent = mensaje;
    contenedor.classList.add("has-error");
    contenedor.classList.remove("has-success");
    input.setAttribute("aria-invalid", "true");
  }

  function limpiarError(input, mensajeExito) {
    var contenedor = campoContenedor(input);
    if (!contenedor) return;
    var errorEl = contenedor.querySelector(".form-error");
    if (errorEl) errorEl.textContent = "";
    contenedor.classList.remove("has-error");
    input.removeAttribute("aria-invalid");
    if (mensajeExito) {
      contenedor.classList.add("has-success");
    } else {
      contenedor.classList.remove("has-success");
    }
  }

  /* Ejecuta `validarFn(input.value) -> true|false` y refleja el resultado en
     la UI con `mensajeError`. Se puede usar en 'input', 'blur' o 'change'. */
  function validarCampo(input, validarFn, mensajeError, opts) {
    var marcarExito = !opts || opts.marcarExito !== false;
    var ok = validarFn(input.value);
    if (ok) {
      limpiarError(input, marcarExito);
    } else {
      mostrarError(input, mensajeError);
    }
    return ok;
  }

  window.AuraValidators = {
    requerido: requerido,
    largoEntre: largoEntre,
    esCorreoValido: esCorreoValido,
    esRunValido: esRunValido,
    esNumero: esNumero,
    esEntero: esEntero,
    numeroEntre: numeroEntre,
    mostrarError: mostrarError,
    limpiarError: limpiarError,
    validarCampo: validarCampo
  };
})();
