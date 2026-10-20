/* =====================================================================
   PRUEBA 2 — Precios, ofertas y filtros del catálogo (services/format.js)
   Tipo: pruebas de LÓGICA.

   ¿Qué se prueba?
   - Que el precio se muestre con el formato chileno ($650.000).
   - Que una propiedad con precio rebajado se reconozca como oferta y se
     cobre el precio rebajado.
   - Que los filtros del catálogo (comuna, tipo, precio, palabra clave,
     orden) devuelvan exactamente las propiedades correctas.
   ===================================================================== */

import { enOferta, filtrarPropiedades, formatPrice, porcentajeDescuento, precioFinal } from "../src/services/format"; // funciones a probar

/* Lista pequeña de propiedades inventadas, solo para estas pruebas. */
const LISTA = [
  { id: "A", nombre: "Casa con jardín", categoria: "Casa", region: "R1", comuna: "Ñuñoa", precio: 900000, descripcion: "patio grande" },
  { id: "B", nombre: "Depto céntrico", categoria: "Departamento", region: "R1", comuna: "Santiago", precio: 500000, precioOferta: 400000, descripcion: "cerca del metro" },
  { id: "C", nombre: "Depto con vista", categoria: "Departamento", region: "R2", comuna: "Viña del Mar", precio: 700000, descripcion: "frente al mar" }
];

describe("Precios y ofertas", () => {

  it("formatea los precios en pesos chilenos", () => {
    expect(formatPrice(650000)).toBe("$650.000"); // separador de miles con punto
    expect(formatPrice(0)).toBe("$0");            // cero se muestra como $0
  });

  it("reconoce una oferta y calcula el precio final y el descuento", () => {
    const depto = LISTA[1];                       // la propiedad "B" tiene precio de oferta
    expect(enOferta(depto)).toBe(true);           // debe reconocerse como oferta
    expect(precioFinal(depto)).toBe(400000);      // se cobra el precio rebajado
    expect(porcentajeDescuento(depto)).toBe(20);  // 400.000 es 20% menos que 500.000
  });

  it("no considera oferta un precio rebajado igual o mayor al normal", () => {
    const rara = { precio: 500000, precioOferta: 500000 }; // "oferta" igual al precio normal
    expect(enOferta(rara)).toBe(false);           // no es una oferta real
    expect(precioFinal(rara)).toBe(500000);       // se cobra el precio normal
  });
});

describe("Filtros del catálogo", () => {

  it("filtra por tipo de inmueble y por comuna", () => {
    const deptos = filtrarPropiedades(LISTA, { categoria: "Departamento" }); // solo departamentos
    expect(deptos.map((p) => p.id)).toEqual(["B", "C"]);                     // deben quedar B y C

    const nunoa = filtrarPropiedades(LISTA, { comuna: "Ñuñoa" });            // solo Ñuñoa
    expect(nunoa.map((p) => p.id)).toEqual(["A"]);                           // solo la casa A
  });

  it("filtra por precio máximo usando el precio con oferta", () => {
    const baratas = filtrarPropiedades(LISTA, { precioMax: 450000 }); // máximo $450.000
    expect(baratas.map((p) => p.id)).toEqual(["B"]);                  // B entra porque su oferta es $400.000
  });

  it("busca por palabra clave sin importar tildes ni mayúsculas", () => {
    const resultado = filtrarPropiedades(LISTA, { q: "JARDIN" }); // escrito en mayúsculas y sin tilde
    expect(resultado.map((p) => p.id)).toEqual(["A"]);            // encuentra "Casa con jardín"

    const porDescripcion = filtrarPropiedades(LISTA, { q: "metro" }); // la palabra está en la descripción
    expect(porDescripcion.map((p) => p.id)).toEqual(["B"]);           // encuentra el depto céntrico
  });

  it("ordena por precio de menor a mayor y de mayor a menor", () => {
    const asc = filtrarPropiedades(LISTA, { orden: "precio-asc" });   // orden ascendente
    expect(asc.map((p) => p.id)).toEqual(["B", "C", "A"]);            // 400.000, 700.000, 900.000

    const desc = filtrarPropiedades(LISTA, { orden: "precio-desc" }); // orden descendente
    expect(desc.map((p) => p.id)).toEqual(["A", "C", "B"]);           // 900.000, 700.000, 400.000
  });

  it("no modifica la lista original al filtrar u ordenar", () => {
    const copia = LISTA.map((p) => p.id);                  // guardamos el orden original
    filtrarPropiedades(LISTA, { orden: "precio-asc" });    // ordenamos
    expect(LISTA.map((p) => p.id)).toEqual(copia);         // la lista original sigue igual
  });
});
