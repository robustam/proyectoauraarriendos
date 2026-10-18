/* =====================================================================
   PRUEBA 5 — Tarjeta de propiedad (components/PropertyCard.jsx)
   Tipo: pruebas de RENDERIZADO, PROPS, RENDERIZADO CONDICIONAL y EVENTOS
   con un MOCK de función.

   ¿Qué se prueba?
   - Que la tarjeta muestre los datos que recibe por props.
   - Que el precio anterior tachado aparezca SOLO si hay oferta.
   - Que el corazón cambie según la prop "guardada".
   - Que al hacer clic en el corazón se llame a la función recibida
     (onToggleGuardar) con el id correcto. Para eso usamos un "espía"
     de Jasmine: una función falsa que anota cada vez que la llaman.
   ===================================================================== */

import PropertyCard from "../components/PropertyCard";                         // componente a probar
import { buscarBoton, hacerClick, hayTexto, limpiarPantalla, renderizar } from "./utils/pantalla"; // ayudantes de prueba

/* Propiedad inventada que se le pasará a la tarjeta por props. */
const PROPIEDAD = {
  id: "PR-9001", nombre: "Depto de prueba", categoria: "Departamento", comuna: "Providencia",
  region: "Región Metropolitana de Santiago", precio: 650000, dormitorios: 2, banos: 1, m2: 55,
  estacionamiento: true, imagenes: ["/img/prop-1-1.jpg"]
};

describe("PropertyCard", () => {

  afterEach(() => limpiarPantalla()); // después de cada prueba borramos lo dibujado

  it("muestra el nombre, la comuna, la categoría y el precio recibidos por props", () => {
    renderizar(<PropertyCard propiedad={PROPIEDAD} />);        // dibujamos la tarjeta con la propiedad de prueba
    expect(hayTexto("Depto de prueba")).toBe(true);            // se ve el nombre
    expect(hayTexto("Providencia, RM")).toBe(true);            // la región larga se abrevia como "RM"
    expect(hayTexto("Departamento")).toBe(true);               // se ve la etiqueta de categoría
    expect(hayTexto("$650.000")).toBe(true);                   // se ve el precio con formato chileno
    expect(document.querySelector("img").getAttribute("src")).toBe("/img/prop-1-1.jpg"); // usa la primera foto
  });

  it("muestra el precio anterior tachado solo cuando hay oferta (renderizado condicional)", () => {
    renderizar(<PropertyCard propiedad={PROPIEDAD} />);                         // sin oferta
    expect(document.querySelector('[data-testid="precio-anterior"]')).toBeNull(); // no hay precio tachado
    limpiarPantalla();                                                          // borramos para dibujar otra versión

    renderizar(<PropertyCard propiedad={{ ...PROPIEDAD, precioOferta: 520000 }} />); // ahora CON oferta
    expect(document.querySelector('[data-testid="precio-anterior"]').textContent).toBe("$650.000"); // aparece el precio antiguo
    expect(hayTexto("$520.000")).toBe(true);                                    // y el precio rebajado
    expect(hayTexto("Oferta -20%")).toBe(true);                                 // con la insignia de descuento
  });

  it("cambia el corazón según la prop 'guardada'", () => {
    renderizar(<PropertyCard propiedad={PROPIEDAD} guardada={false} />);       // no guardada
    expect(buscarBoton("Guardar en mis solicitudes").textContent).toBe("♡");   // corazón vacío
    limpiarPantalla();                                                         // borramos

    renderizar(<PropertyCard propiedad={PROPIEDAD} guardada={true} />);        // guardada
    const boton = buscarBoton("Quitar de mis solicitudes");                    // el texto accesible cambia
    expect(boton.textContent).toBe("♥");                                       // corazón lleno
    expect(boton.getAttribute("aria-pressed")).toBe("true");                   // y se marca como presionado
  });

  it("llama a onToggleGuardar con el id de la propiedad al hacer clic (evento + mock)", () => {
    const alGuardar = jasmine.createSpy("onToggleGuardar");                    // función falsa que registra sus llamadas
    renderizar(<PropertyCard propiedad={PROPIEDAD} onToggleGuardar={alGuardar} />); // se la pasamos por props
    hacerClick(buscarBoton("Guardar en mis solicitudes"));                     // simulamos el clic en el corazón
    expect(alGuardar).toHaveBeenCalledTimes(1);                                // se llamó exactamente una vez
    expect(alGuardar).toHaveBeenCalledWith("PR-9001");                         // con el id de la propiedad
  });
});
