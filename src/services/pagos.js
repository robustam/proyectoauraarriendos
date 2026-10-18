/* AuraArriendos — pasarela de pago SIMULADA (no cobra dinero real).

   Se usa en el Checkout para pagar la reserva (primer mes de arriendo).
   Está en un objeto aparte para que las pruebas puedan reemplazarla con un
   "mock" (spyOn(pagos, "procesarPago")) y forzar un pago aprobado o rechazado
   sin depender de qué tarjeta se escriba. */

/* Tarjetas de prueba (se muestran en el formulario, como las cuentas demo). */
export const TARJETAS_PRUEBA = {
  aprobada: "4242 4242 4242 4242",
  rechazada: "4000 0000 0000 0002"
};

const pagos = {
  /* Recibe { numeroTarjeta, monto } y responde:
     { aprobado: true, codigoAutorizacion }  o  { aprobado: false, motivo } */
  procesarPago({ numeroTarjeta, monto }) {
    const digitos = String(numeroTarjeta || "").replace(/\D/g, "");
    if (!(Number(monto) > 0)) {
      return { aprobado: false, motivo: "El monto a pagar no es válido." };
    }
    if (digitos === TARJETAS_PRUEBA.rechazada.replace(/\s/g, "")) {
      return { aprobado: false, motivo: "Tarjeta rechazada por el banco emisor." };
    }
    return { aprobado: true, codigoAutorizacion: "AUT-" + String(Date.now()).slice(-6) };
  }
};

export default pagos;
