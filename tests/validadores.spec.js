/* =====================================================================
   PRUEBA 1 — Validaciones de formularios (services/validators.js)
   Tipo: pruebas de LÓGICA (funciones puras, sin pantalla).

   ¿Qué se prueba?
   Las reglas que usan todos los formularios: RUT chileno, correos con
   dominios permitidos, nombres, números, tarjeta de crédito y vencimiento.
   Si alguna de estas funciones falla, los formularios aceptarían datos
   malos o rechazarían datos buenos.
   ===================================================================== */

import * as V from "../src/services/validators"; // importamos todas las funciones de validación como "V"

describe("Validaciones de formularios", () => { // describe agrupa varias pruebas relacionadas

  it("acepta un RUT válido y rechaza uno con dígito verificador incorrecto", () => { // it = una prueba
    expect(V.esRunValido("123456785")).toBe(true);   // 12.345.678-5 es un RUT real: debe ser válido
    expect(V.esRunValido("11111111K")).toBe(false);  // mismo largo, pero el dígito verificador no corresponde
    expect(V.esRunValido("123")).toBe(false);        // muy corto: menos de 7 caracteres
    expect(V.esRunValido("12345678-5")).toBe(false); // con guion no es válido (se pide sin puntos ni guion)
  });

  it("limpia un RUT escrito con puntos y guion", () => {
    expect(V.limpiarRun("12.345.678-5")).toBe("123456785"); // quita puntos y guion
    expect(V.limpiarRun("19.011.022-k")).toBe("19011022K"); // además pasa la "k" a mayúscula
  });

  it("solo acepta correos de los dominios permitidos", () => {
    expect(V.esCorreoValido("ana@duoc.cl")).toBe(true);              // dominio permitido
    expect(V.esCorreoValido("profe@profesor.duoc.cl")).toBe(true);   // dominio permitido
    expect(V.esCorreoValido("ana@gmail.com")).toBe(true);            // dominio permitido
    expect(V.esCorreoValido("ana@hotmail.com")).toBe(false);         // dominio NO permitido
    expect(V.esCorreoValido("ana-sin-arroba.com")).toBe(false);      // no tiene formato de correo
  });

  it("valida nombres de persona (solo letras, tildes, espacios y guion)", () => {
    expect(V.esNombrePersona("María José")).toBe(true);   // letras con tilde y espacio: válido
    expect(V.esNombrePersona("Pérez-Soto")).toBe(true);   // apellido compuesto con guion: válido
    expect(V.esNombrePersona("Ana2")).toBe(false);        // contiene un número: inválido
    expect(V.esNombrePersona("   ")).toBe(false);         // solo espacios: inválido
  });

  it("valida largos y rangos numéricos", () => {
    expect(V.requerido("  hola ")).toBe(true);        // tiene texto aunque tenga espacios alrededor
    expect(V.requerido("   ")).toBe(false);           // solo espacios cuenta como vacío
    expect(V.largoEntre("abcd", 4, 10)).toBe(true);   // 4 caracteres: dentro del rango 4-10
    expect(V.largoEntre("abc", 4, 10)).toBe(false);   // 3 caracteres: muy corto
    expect(V.esEntero("3")).toBe(true);               // "3" es un número entero
    expect(V.esEntero("3.5")).toBe(false);            // 3,5 no es entero
    expect(V.numeroEntre("-1", 0, null)).toBe(false); // negativo: fuera del mínimo 0
  });

  it("valida el número de tarjeta con el algoritmo de Luhn", () => {
    expect(V.esTarjetaValida("4242 4242 4242 4242")).toBe(true);  // tarjeta de prueba válida (con espacios)
    expect(V.esTarjetaValida("4000000000000002")).toBe(true);     // otra tarjeta de prueba válida
    expect(V.esTarjetaValida("4242 4242 4242 4241")).toBe(false); // un dígito cambiado: Luhn falla
    expect(V.esTarjetaValida("1234")).toBe(false);                // demasiado corta
  });

  it("valida la fecha de vencimiento MM/AA respecto de una fecha dada", () => {
    const hoy = new Date(2026, 9, 17);                     // fijamos "hoy" en 17-oct-2026 para que la prueba no dependa del día real
    expect(V.esVencimientoValido("12/27", hoy)).toBe(true);  // diciembre 2027: todavía vigente
    expect(V.esVencimientoValido("10/26", hoy)).toBe(true);  // octubre 2026: vence a fin de mes, aún sirve
    expect(V.esVencimientoValido("09/26", hoy)).toBe(false); // septiembre 2026: ya venció
    expect(V.esVencimientoValido("13/27", hoy)).toBe(false); // el mes 13 no existe
    expect(V.esCvvValido("123")).toBe(true);                 // CVV de 3 dígitos: válido
    expect(V.esCvvValido("12")).toBe(false);                 // CVV de 2 dígitos: inválido
  });
});
