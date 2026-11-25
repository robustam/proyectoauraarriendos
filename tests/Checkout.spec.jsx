/* =====================================================================
   PRUEBA — Checkout y pago de la reserva (pages/Checkout.jsx)
   Tipo: prueba de COMPONENTE + uso de MOCKS (espías).

   Desde la EP3 el pago lo procesa el BACKEND (POST /api/v1/boletas).
   En las pruebas no hay backend: reemplazamos api.post con un espía
     api.post.mockReturnValue(Promise.resolve(boletaPagada))
   para simular que el servidor aprobó o rechazó el pago.

   ¿Qué se prueba?
   - Sin sesión, el checkout envía a iniciar sesión.
   - Con sesión, los datos del cliente se completan solos.
   - Se envían al backend SOLO los ids de las propiedades (el total lo calcula el servidor).
   - Pago aprobado: muestra la boleta y quita las solicitudes.
   - Pago rechazado: muestra el motivo y deja las solicitudes.
   - Error del backend (ej: propiedad no disponible): se muestra su mensaje.
   - Una tarjeta inválida ni siquiera llega al backend.
   ===================================================================== */

import { Route } from "react-router-dom";                                   // para declarar rutas
import Checkout from "../src/pages/Checkout";                                   // página de pago
import CompraResultado from "../src/pages/CompraResultado";                     // página de resultado
import { api, ApiError } from "../src/services/api";                         // cliente de la API (se reemplaza con espías)
import * as store from "../src/services/store";                                 // datos
import {
  buscarBoton, buscarCampo, datosDeEjemplo, escribir, esperar, hacerClick, hayTexto, iniciarSesionComo, limpiarPantalla, renderizar
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

/* Boleta como la devuelve el backend (BoletaDTO). */
function boletaDelBackend(estado, extra) {
  return {
    id: 25, numero: 20260004, fecha: "2030-02-01T10:00:00", estado,
    cliente: { nombre: "Matías", apellidos: "Fernández Lira", correo: "cliente@gmail.com" },
    direccion: { calle: "Av. Vicuña Mackenna 8900", departamento: "", region: "Región Metropolitana de Santiago", comuna: "La Florida", indicaciones: "" },
    fechaInicio: "2030-03-01", tarjeta: "•••• 4242", usuarioCorreo: "cliente@gmail.com",
    items: [
      { id: 1, propiedadId: "PR-1001", nombre: "Departamento luminoso en Providencia", comuna: "Providencia", imagen: "/img/prop-1-1.jpg", precio: 650000 },
      { id: 2, propiedadId: "PR-1004", nombre: "Casa remodelada en Viña del Mar", comuna: "Viña del Mar", imagen: "/img/prop-4-1.jpg", precio: 790000 }
    ],
    total: 1440000,
    ...extra
  };
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

  it("con pago APROBADO envía los ids al backend, muestra la boleta y vacía las solicitudes", async () => {
    api.post.mockReturnValue(Promise.resolve(boletaDelBackend("pagada", { codigoAutorizacion: "AUT-123456" }))); // el backend "aprueba"
    dibujarCheckout();                                                  // entramos al checkout
    completarPago("4242 4242 4242 4242");                               // completamos la tarjeta
    hacerClick(buscarBoton("Pagar ahora $1.440.000"));                  // presionamos pagar
    await esperar();                                                    // esperamos la respuesta (simulada) del backend

    const [ruta, cuerpo] = api.post.mock.lastCall;            // lo que se envió a la API
    expect(ruta).toBe("/boletas");                                      // endpoint del checkout
    expect(cuerpo.propiedadIds).toEqual(["PR-1001", "PR-1004"]);        // solo los ids: el total lo calcula el backend
    expect(cuerpo.total).toBeUndefined();                               // el frontend NO envía el total
    expect(cuerpo.tarjeta.numero).toBe("4242 4242 4242 4242");          // datos de la tarjeta para la pasarela
    expect(hayTexto("Se ha realizado la reserva nro #20260004")).toBe(true); // página de éxito con el número del backend
    expect(hayTexto("AUT-123456")).toBe(true);                          // muestra el código de autorización
    expect(store.getSolicitudes()).toEqual([]);                         // las solicitudes pagadas se quitaron
    expect(store.getOrdenPorId(25).estado).toBe("pagada");              // la boleta quedó en la caché
  });

  it("con pago RECHAZADO muestra el motivo y no toca las solicitudes", async () => {
    api.post.mockReturnValue(Promise.resolve(boletaDelBackend("rechazada", { motivoRechazo: "Tarjeta rechazada por el banco emisor." })));
    dibujarCheckout();                                                  // entramos al checkout
    completarPago("4000 0000 0000 0002");                               // tarjeta de prueba que el banco rechaza
    hacerClick(buscarBoton("Pagar ahora $1.440.000"));                  // presionamos pagar
    await esperar();

    expect(hayTexto("No se pudo realizar el pago nro #20260004")).toBe(true); // página de error
    expect(hayTexto("Tarjeta rechazada por el banco emisor.")).toBe(true); // con el motivo devuelto
    expect(buscarBoton("Volver a realizar el pago")).toBeTruthy();      // y la opción de reintentar
    expect(store.getSolicitudes().length).toBe(2);                      // las solicitudes siguen ahí
  });

  it("si el backend rechaza la reserva muestra su mensaje en el formulario", async () => {
    api.post.mockReturnValue(Promise.reject(new ApiError("La propiedad Casa remodelada en Viña del Mar ya no está disponible para reservar", 400)));
    dibujarCheckout();
    completarPago("4242 4242 4242 4242");
    hacerClick(buscarBoton("Pagar ahora $1.440.000"));
    await esperar();

    expect(hayTexto("ya no está disponible para reservar")).toBe(true); // el mensaje del servidor se ve en pantalla
    expect(store.getSolicitudes().length).toBe(2);                      // no se quitó nada
  });

  it("con una tarjeta inválida muestra el error y NO llama al backend", () => {
    dibujarCheckout();                                                  // entramos al checkout
    completarPago("1234 5678");                                         // número de tarjeta inválido
    hacerClick(buscarBoton("Pagar ahora $1.440.000"));                  // intentamos pagar

    expect(hayTexto("Número de tarjeta inválido.")).toBe(true);         // aparece el error del campo
    expect(api.post).not.toHaveBeenCalledWith("/boletas", expect.anything()); // el backend nunca se llamó
  });
});
