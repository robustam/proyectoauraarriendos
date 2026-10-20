/* =====================================================================
   PRUEBA 14 — Checkout y pago (pages/Checkout.jsx + CompraResultado.jsx)
   Tipo: flujo completo con MOCK de un servicio externo.

   ¿Qué es un mock aquí?
   El checkout llama a pagos.procesarPago(). En las pruebas NO queremos
   depender de esa pasarela, así que la reemplazamos con un espía de
   Jasmine que responde lo que nosotros decidimos:
     spyOn(pagos, "procesarPago").and.returnValue({ aprobado: true, ... })
   Así probamos los dos caminos (pago aprobado y pago rechazado) de forma
   controlada y verificamos con qué datos se llamó al servicio.

   ¿Qué se prueba?
   - Sin sesión, el checkout manda a iniciar sesión.
   - Los datos del cliente se completan solos desde su cuenta.
   - Pago aprobado: se crea la orden, se vacían las solicitudes pagadas,
     baja el stock y se muestra "Se ha realizado la reserva".
   - Pago rechazado: se muestra "No se pudo realizar el pago", las
     solicitudes se mantienen y el stock no cambia.
   - Una tarjeta inválida ni siquiera llega a la pasarela.
   ===================================================================== */

import { Route } from "react-router-dom";                                   // para declarar rutas
import Checkout from "../src/pages/Checkout";                                   // página de pago
import CompraResultado from "../src/pages/CompraResultado";                     // página de resultado
import pagos from "../src/services/pagos";                                      // servicio que vamos a reemplazar (mock)
import * as store from "../src/services/store";                                 // datos
import {
  buscarBoton, buscarCampo, datosDeEjemplo, escribir, hacerClick, hayTexto, iniciarSesionComo, limpiarPantalla, renderizar
} from "./utils/pantalla";                                                  // ayudantes

/* Dibuja el checkout con sus páginas de resultado y una página falsa de login. */
function dibujarCheckout() {
  renderizar(null, {
    ruta: "/checkout",                                                      // empezamos en el checkout
    rutas: [
      <Route key="c" path="/checkout" element={<Checkout />} />,            // página real de pago
      <Route key="e" path="/compra/exito/:id" element={<CompraResultado />} />, // resultado: pago correcto
      <Route key="x" path="/compra/error/:id" element={<CompraResultado />} />, // resultado: pago con error
      <Route key="l" path="/login" element={<p>PÁGINA DE LOGIN</p>} />      // login falso
    ]
  });
}

/* Completa los datos que no vienen de la cuenta: fecha y tarjeta. */
function completarPago(numeroTarjeta) {
  escribir(buscarCampo("Inicio del arriendo *"), "2030-03-01");             // fecha futura de inicio
  escribir(buscarCampo("Número de tarjeta *"), numeroTarjeta);              // número de tarjeta
  escribir(buscarCampo("Vencimiento *"), "12/30");                          // vencimiento futuro
  escribir(buscarCampo("CVV *"), "123");                                    // código de seguridad
}

describe("Checkout y pago de la reserva", () => {

  beforeEach(() => {
    datosDeEjemplo();                                    // datos limpios
    iniciarSesionComo("cliente@gmail.com");              // sesión del cliente de prueba
    store.agregarSolicitud("PR-1001");                   // guarda un depto de $650.000 (3 unidades)
    store.agregarSolicitud("PR-1004");                   // y una casa en oferta a $790.000
  });
  afterEach(() => limpiarPantalla());                    // pantalla limpia

  it("sin sesión envía a iniciar sesión", () => {
    store.cerrarSesion();                                // cerramos la sesión
    dibujarCheckout();                                   // intentamos entrar al checkout
    expect(hayTexto("PÁGINA DE LOGIN")).toBe(true);      // nos redirige al login
  });

  it("completa automáticamente los datos del cliente con sesión iniciada", () => {
    dibujarCheckout();                                                  // entramos al checkout
    expect(buscarCampo("Nombre *").value).toBe("Matías");               // nombre desde la cuenta
    expect(buscarCampo("Correo *").value).toBe("cliente@gmail.com");    // correo desde la cuenta
    expect(buscarCampo("Comuna").value).toBe("La Florida");             // comuna desde la cuenta
    expect(hayTexto("Total: $1.440.000")).toBe(true);                   // total = 650.000 + 790.000 (oferta)
  });

  it("con pago APROBADO crea la orden, vacía las solicitudes y baja el stock", () => {
    const mockPago = spyOn(pagos, "procesarPago").and.returnValue({ aprobado: true, codigoAutorizacion: "AUT-123456" }); // la pasarela "aprueba"
    dibujarCheckout();                                                  // entramos al checkout
    completarPago("4242 4242 4242 4242");                               // completamos la tarjeta
    hacerClick(buscarBoton("Pagar ahora $1.440.000"));                  // presionamos pagar

    expect(mockPago).toHaveBeenCalledOnceWith({ numeroTarjeta: "4242 4242 4242 4242", monto: 1440000 }); // se cobró el total correcto
    expect(hayTexto("Se ha realizado la reserva nro #20260004")).toBe(true); // página de éxito con el número siguiente
    expect(hayTexto("AUT-123456")).toBe(true);                          // muestra el código que devolvió la pasarela
    expect(store.getSolicitudes()).toEqual([]);                         // las solicitudes pagadas se quitaron
    expect(store.getPropiedadPorId("PR-1001").unidadesDisponibles).toBe(2); // el stock bajó de 3 a 2
    expect(store.getOrdenes()[0].estado).toBe("pagada");                // la orden más reciente quedó pagada
  });

  it("con pago RECHAZADO muestra el error y no toca las solicitudes ni el stock", () => {
    spyOn(pagos, "procesarPago").and.returnValue({ aprobado: false, motivo: "Fondos insuficientes" }); // la pasarela "rechaza"
    dibujarCheckout();                                                  // entramos al checkout
    completarPago("4242 4242 4242 4242");                               // aunque la tarjeta sea buena, el mock decide
    hacerClick(buscarBoton("Pagar ahora $1.440.000"));                  // presionamos pagar

    expect(hayTexto("No se pudo realizar el pago nro #20260004")).toBe(true); // página de error
    expect(hayTexto("Fondos insuficientes")).toBe(true);                // con el motivo devuelto
    expect(buscarBoton("Volver a realizar el pago")).toBeTruthy();      // y la opción de reintentar
    expect(store.getSolicitudes().length).toBe(2);                      // las solicitudes siguen ahí
    expect(store.getPropiedadPorId("PR-1001").unidadesDisponibles).toBe(3); // el stock no cambió
  });

  it("con una tarjeta inválida muestra el error y NO llama a la pasarela", () => {
    const mockPago = spyOn(pagos, "procesarPago");                      // espía sin respuesta: solo vigila
    dibujarCheckout();                                                  // entramos al checkout
    completarPago("1234 5678");                                         // número de tarjeta inválido
    hacerClick(buscarBoton("Pagar ahora $1.440.000"));                  // intentamos pagar

    expect(hayTexto("Número de tarjeta inválido.")).toBe(true);         // aparece el error del campo
    expect(mockPago).not.toHaveBeenCalled();                            // la pasarela nunca se llamó
    expect(store.getOrdenes().length).toBe(3);                          // no se creó ninguna orden nueva
  });
});
