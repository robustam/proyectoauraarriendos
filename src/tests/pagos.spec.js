/* =====================================================================
   PRUEBA 4 — Pasarela de pago simulada (services/pagos.js)
   Tipo: prueba de LÓGICA.

   ¿Qué se prueba?
   Que el servicio de pago apruebe la tarjeta de prueba buena, rechace la
   tarjeta de prueba mala y no acepte montos en cero.
   ===================================================================== */

import pagos, { TARJETAS_PRUEBA } from "../services/pagos"; // el servicio y las tarjetas de prueba

describe("Servicio de pagos (simulado)", () => {

  it("aprueba la tarjeta de prueba y entrega un código de autorización", () => {
    const r = pagos.procesarPago({ numeroTarjeta: TARJETAS_PRUEBA.aprobada, monto: 650000 }); // pagamos con la tarjeta buena
    expect(r.aprobado).toBe(true);                       // el pago queda aprobado
    expect(r.codigoAutorizacion).toMatch(/^AUT-\d{6}$/); // el código tiene la forma AUT-123456
  });

  it("rechaza la tarjeta de prueba de rechazo con un motivo", () => {
    const r = pagos.procesarPago({ numeroTarjeta: TARJETAS_PRUEBA.rechazada, monto: 650000 }); // pagamos con la tarjeta mala
    expect(r.aprobado).toBe(false);                      // el pago NO se aprueba
    expect(r.motivo).toContain("rechazada");             // se explica por qué
  });

  it("rechaza un pago con monto cero", () => {
    const r = pagos.procesarPago({ numeroTarjeta: TARJETAS_PRUEBA.aprobada, monto: 0 }); // monto inválido
    expect(r.aprobado).toBe(false);                      // no se puede pagar $0
  });
});
