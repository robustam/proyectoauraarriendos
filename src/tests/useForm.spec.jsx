/* =====================================================================
   PRUEBA 10 — Hook de formularios (hooks/useForm.js)
   Tipo: pruebas de ESTADO (state).

   ¿Qué se prueba?
   El hook que manejan todos los formularios: guarda lo que se escribe
   (estado), valida en tiempo real y valida todo al enviar.
   Como un hook solo funciona dentro de un componente, creamos un
   componente pequeño de prueba que lo usa.
   ===================================================================== */

import useForm from "../hooks/useForm";                                     // hook a probar
import { buscarCampo, enviarFormulario, escribir, hayTexto, limpiarPantalla, renderizar } from "./utils/pantalla"; // ayudantes

/* Reglas de ejemplo: el nombre es obligatorio y la edad debe ser 18 o más. */
const REGLAS = {
  nombre: (v) => (v.trim() ? null : "El nombre es obligatorio"),
  edad: (v) => (Number(v) >= 18 ? null : "Debes ser mayor de edad")
};

/* Componente de prueba: un formulario con dos campos que usa el hook. */
let resultadoEnvio;                                     // aquí guardamos si el formulario fue válido al enviarse
function FormularioDePrueba() {
  const form = useForm({ nombre: "", edad: "" }, REGLAS); // usamos el hook con valores iniciales vacíos
  return (
    <form onSubmit={(e) => { e.preventDefault(); resultadoEnvio = form.validateAll(); }}>
      <label htmlFor="nombre">Nombre</label>
      <input {...form.bind("nombre")} />
      {form.status.nombre?.error && <p>{form.status.nombre.error}</p>}
      <label htmlFor="edad">Edad</label>
      <input {...form.bind("edad")} />
      {form.status.edad?.error && <p>{form.status.edad.error}</p>}
      <p data-testid="vista-previa">Hola {form.values.nombre}</p>
    </form>
  );
}

describe("useForm", () => {

  beforeEach(() => { resultadoEnvio = undefined; });   // reiniciamos el resultado antes de cada prueba
  afterEach(() => limpiarPantalla());                  // limpiamos la pantalla después

  it("actualiza el estado cuando el usuario escribe", () => {
    renderizar(<FormularioDePrueba />);                                  // dibujamos el formulario
    escribir(buscarCampo("Nombre"), "Camila");                           // la persona escribe "Camila"
    expect(buscarCampo("Nombre").value).toBe("Camila");                  // el input muestra el texto
    expect(document.querySelector('[data-testid="vista-previa"]').textContent).toBe("Hola Camila"); // el estado se usa en la pantalla
  });

  it("valida en tiempo real mientras se escribe", () => {
    renderizar(<FormularioDePrueba />);                                  // dibujamos el formulario
    escribir(buscarCampo("Edad"), "15");                                 // escribe una edad menor
    expect(hayTexto("Debes ser mayor de edad")).toBe(true);              // aparece el error al instante
    escribir(buscarCampo("Edad"), "20");                                 // corrige la edad
    expect(hayTexto("Debes ser mayor de edad")).toBe(false);             // el error desaparece
  });

  it("al enviar valida todos los campos y devuelve si el formulario es válido", () => {
    renderizar(<FormularioDePrueba />);                                  // dibujamos el formulario
    enviarFormulario(document.querySelector("form"));                    // envía sin completar nada
    expect(resultadoEnvio).toBe(false);                                  // no es válido
    expect(hayTexto("El nombre es obligatorio")).toBe(true);             // muestra el error del nombre
    expect(hayTexto("Debes ser mayor de edad")).toBe(true);              // y el de la edad

    escribir(buscarCampo("Nombre"), "Camila");                           // completa el nombre
    escribir(buscarCampo("Edad"), "30");                                 // y una edad válida
    enviarFormulario(document.querySelector("form"));                    // vuelve a enviar
    expect(resultadoEnvio).toBe(true);                                   // ahora sí es válido
  });
});
