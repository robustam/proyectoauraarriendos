/* AuraArriendos — validaciones puras reutilizables (retornan true/false). */

import { CORREOS_VALIDOS } from "../data/manifest";

export function soloDigitos(str) {
  return /^[0-9]+$/.test(String(str || ""));
}

export function requerido(valor) {
  return String(valor == null ? "" : valor).trim().length > 0;
}

export function largoEntre(valor, min, max) {
  const len = String(valor == null ? "" : valor).trim().length;
  if (min != null && len < min) return false;
  if (max != null && len > max) return false;
  return true;
}

export function esCorreoValido(correo, dominiosPermitidos = CORREOS_VALIDOS) {
  const v = String(correo || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return false;
  if (!dominiosPermitidos || !dominiosPermitidos.length) return true;
  return dominiosPermitidos.indexOf(v.split("@")[1].toLowerCase()) !== -1;
}

/* Quita puntos y guion y pasa a mayúsculas: "12.345.678-5" -> "123456785". */
export function limpiarRun(run) {
  return String(run || "").toUpperCase().replace(/[.\-\s]/g, "");
}

/* RUT chileno, módulo 11. Formato sin puntos ni guion (7 a 9 caracteres). */
export function esRunValido(run) {
  const v = String(run || "").trim().toUpperCase();
  if (v.length < 7 || v.length > 9) return false;
  if (!/^[0-9]+[0-9K]$/.test(v)) return false;

  const cuerpo = v.slice(0, -1);
  const dv = v.slice(-1);
  if (!soloDigitos(cuerpo)) return false;

  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
  return dvEsperado === dv;
}

/* Solo letras (con tildes y ñ); admite espacios, guion y apóstrofe entre palabras. */
export function esNombrePersona(valor) {
  return /^\p{L}+(?:[ '’-]\p{L}+)*$/u.test(String(valor || "").trim());
}

export function esNumero(valor) {
  return valor !== "" && valor != null && !isNaN(Number(valor));
}

export function esEntero(valor) {
  return esNumero(valor) && Number.isInteger(Number(valor));
}

export function numeroEntre(valor, min, max) {
  if (!esNumero(valor)) return false;
  const n = Number(valor);
  if (min != null && n < min) return false;
  if (max != null && n > max) return false;
  return true;
}

/* Número de tarjeta: 13 a 19 dígitos que pasan el algoritmo de Luhn
   (el dígito de control que usan todas las tarjetas bancarias). */
export function esTarjetaValida(numero) {
  const digitos = String(numero || "").replace(/[\s-]/g, "");
  if (!/^\d{13,19}$/.test(digitos)) return false;
  let suma = 0;
  let duplicar = false;
  for (let i = digitos.length - 1; i >= 0; i--) {
    let d = parseInt(digitos.charAt(i), 10);
    if (duplicar) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    suma += d;
    duplicar = !duplicar;
  }
  return suma % 10 === 0;
}

/* Vencimiento "MM/AA" que todavía no ha pasado. `hoy` permite fijar la fecha en las pruebas. */
export function esVencimientoValido(valor, hoy = new Date()) {
  const m = /^(\d{2})\/(\d{2})$/.exec(String(valor || "").trim());
  if (!m) return false;
  const mes = Number(m[1]);
  const anio = 2000 + Number(m[2]);
  if (mes < 1 || mes > 12) return false;
  const finDeMes = new Date(anio, mes, 0, 23, 59, 59);
  return finDeMes >= hoy;
}

export function esCvvValido(valor) {
  return /^\d{3,4}$/.test(String(valor || "").trim());
}
