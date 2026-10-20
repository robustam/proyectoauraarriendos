/* =====================================================================
   PRUEBA 16 — Registro de cuenta (pages/Registro.jsx)
   Tipo: pruebas de ESTADO, RENDERIZADO CONDICIONAL, EVENTOS y NAVEGACIÓN.

   ¿Qué se prueba?
   - Enviar el formulario vacío muestra los errores y no crea ningún usuario.
   - El nombre no acepta números (validación pedida en la Evaluación 1).
   - No se puede registrar un correo ni un RUN que ya existen.
   - La confirmación de contraseña debe ser igual a la contraseña.
   - Un registro correcto crea un usuario CLIENTE, inicia su sesión y
     navega a la página de inicio.
   ===================================================================== */

import { Route } from "react-router-dom";                                   // para declarar rutas de prueba
import Registro from "../src/pages/Registro";                                   // página a probar
import * as store from "../src/services/store";                                 // para revisar los usuarios guardados
import {
  buscarBoton, buscarCampo, datosDeEjemplo, escribir, hacerClick, hayTexto, limpiarPantalla, renderizar, seleccionar
} from "./utils/pantalla";                                                  // ayudantes

/* Dibuja el registro junto a una página de inicio falsa para ver a dónde nos manda. */
function dibujarRegistro() {
  renderizar(null, {
    ruta: "/registro",
    rutas: [
      <Route key="r" path="/registro" element={<Registro />} />,            // página real
      <Route key="i" path="/" element={<p>PÁGINA DE INICIO</p>} />          // destino falso tras registrarse
    ]
  });
}

/* Completa el formulario con datos válidos; cada prueba cambia solo lo que necesita. */
function completar(datos = {}) {
  const v = {
    run: "123456785", nombre: "Camila", apellidos: "Rivas Soto", correo: "camila@gmail.com",
    region: "Región Metropolitana de Santiago", comuna: "Providencia", direccion: "Los Leones 100",
    clave: "clave123", confirmar: "clave123", ...datos
  };
  escribir(buscarCampo("RUN"), v.run);
  escribir(buscarCampo("Nombre"), v.nombre);
  escribir(buscarCampo("Apellidos"), v.apellidos);
  escribir(buscarCampo("Correo electrónico"), v.correo);
  seleccionar(buscarCampo("Región"), v.region);                             // primero la región...
  seleccionar(buscarCampo("Comuna"), v.comuna);                             // ...recién ahí se habilitan las comunas
  escribir(buscarCampo("Dirección"), v.direccion);
  escribir(buscarCampo("Contraseña"), v.clave);
  escribir(buscarCampo("Confirmar contraseña"), v.confirmar);
}

describe("Registro de cuenta", () => {

  beforeEach(() => datosDeEjemplo());   // datos limpios y sin sesión
  afterEach(() => limpiarPantalla());   // pantalla limpia

  it("muestra los errores y no crea ningún usuario si se envía vacío", () => {
    dibujarRegistro();
    hacerClick(buscarBoton("Registrar"));                                   // enviamos sin completar
    expect(hayTexto("Revisa los campos marcados en rojo.")).toBe(true);     // aviso general
    expect(hayTexto("RUN inválido.")).toBe(true);                           // error del RUN
    expect(hayTexto("Selecciona tu región.")).toBe(true);                   // error de la región
    expect(store.getUsuarios().length).toBe(3);                             // siguen los 3 usuarios de ejemplo
  });

  it("rechaza nombres con números", () => {
    dibujarRegistro();
    const nombre = buscarCampo("Nombre");
    escribir(nombre, "Ana123");                                             // nombre con números
    expect(nombre.classList).toContain("is-invalid");                       // queda en rojo
    expect(hayTexto("Ingresa tu nombre usando solo letras")).toBe(true);    // con su mensaje
    escribir(nombre, "Ana");                                                // lo corregimos
    expect(nombre.classList).toContain("is-valid");                         // ahora queda en verde
  });

  it("no permite registrar un correo ni un RUN que ya existen", () => {
    dibujarRegistro();
    escribir(buscarCampo("Correo electrónico"), "cliente@gmail.com");       // correo de un usuario de ejemplo
    expect(hayTexto("Ese correo ya está registrado.")).toBe(true);
    escribir(buscarCampo("RUN"), "333333333");                              // RUN de ese mismo usuario
    expect(hayTexto("Ese RUN ya está registrado.")).toBe(true);
  });

  it("valida que la confirmación sea igual a la contraseña", () => {
    dibujarRegistro();
    escribir(buscarCampo("Contraseña"), "clave123");
    escribir(buscarCampo("Confirmar contraseña"), "otraClave");             // no coincide
    expect(hayTexto("Las contraseñas no coinciden.")).toBe(true);
    escribir(buscarCampo("Contraseña"), "otraClave");                       // al cambiar la contraseña se revalida la confirmación
    expect(hayTexto("Las contraseñas no coinciden.")).toBe(false);
  });

  it("con datos válidos crea un cliente, inicia su sesión y va al inicio", () => {
    dibujarRegistro();
    completar();                                                            // todos los datos válidos
    hacerClick(buscarBoton("Registrar"));

    const nuevo = store.getUsuarioPorCorreo("camila@gmail.com");            // el usuario quedó guardado
    expect(nuevo).toBeTruthy();
    expect(nuevo.tipoUsuario).toBe("Cliente");                              // siempre se registra como Cliente
    expect(nuevo.comuna).toBe("Providencia");
    expect(store.getSesion().correo).toBe("camila@gmail.com");              // y ya tiene la sesión iniciada
    expect(hayTexto("PÁGINA DE INICIO")).toBe(true);                        // navegó al inicio
  });
});
