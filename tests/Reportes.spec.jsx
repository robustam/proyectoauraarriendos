/* =====================================================================
   PRUEBA 19 — Reportes del panel (pages/admin/Reportes.jsx)
   Tipo: LÓGICA pura + RENDERIZADO de datos calculados.

   ¿Qué se prueba?
   - ingresosPorMes suma solo las órdenes PAGADAS y las asigna a su mes.
   - Los indicadores (KPI) se calculan con las órdenes de ejemplo:
     2 pagadas ($420.000 + $900.000) y 1 rechazada → 67 % de aprobación.
   - Sin órdenes, los indicadores muestran 0 en vez de fallar (división por cero).
   ===================================================================== */

import Reportes, { ingresosPorMes } from "../src/pages/admin/Reportes";         // vista y función a probar
import * as store from "../src/services/store";                                 // datos
import { datosDeEjemplo, hayTexto, limpiarPantalla, renderizar } from "./utils/pantalla"; // ayudantes

describe("Reportes — ingresosPorMes", () => {

  it("suma solo las órdenes pagadas en el mes que corresponde", () => {
    const hoy = new Date(2026, 9, 15);                                      // 15 de octubre de 2026
    const ordenes = [
      { estado: "pagada", fecha: "2026-08-12T15:00:00", total: 420000 },
      { estado: "rechazada", fecha: "2026-09-03T18:00:00", total: 980000 }, // rechazada: no suma
      { estado: "pagada", fecha: "2026-10-02T13:00:00", total: 900000 },
      { estado: "pagada", fecha: "2026-10-09T10:00:00", total: 100000 },    // dos pagos en el mismo mes
      { estado: "pagada", fecha: "2025-01-10T10:00:00", total: 777 }        // fuera de los últimos 6 meses: se ignora
    ];
    const meses = ingresosPorMes(ordenes, 6, hoy);
    expect(meses.map((m) => m.etiqueta)).toEqual(["May", "Jun", "Jul", "Ago", "Sep", "Oct"]); // 6 meses terminando en octubre
    expect(meses.map((m) => m.total)).toEqual([0, 0, 0, 420000, 0, 1000000]);
  });

  it("devuelve todos los meses en cero si no hay órdenes", () => {
    const meses = ingresosPorMes([], 3, new Date(2026, 0, 20));             // enero: cruza al año anterior
    expect(meses.map((m) => m.etiqueta)).toEqual(["Nov", "Dic", "Ene"]);
    expect(meses.every((m) => m.total === 0)).toBe(true);
  });
});

describe("Reportes — vista", () => {

  beforeEach(() => datosDeEjemplo());
  afterEach(() => limpiarPantalla());

  it("calcula ingresos, órdenes pagadas y tasa de aprobación", () => {
    renderizar(<Reportes />);
    expect(hayTexto("Ingresos por reservas")).toBe(true);
    expect(hayTexto("$1.320.000")).toBe(true);                              // 420.000 + 900.000
    expect(hayTexto("67%")).toBe(true);                                     // 2 de 3 órdenes
    expect(hayTexto("Propiedades por categoría")).toBe(true);               // secciones del reporte
    expect(hayTexto("Comunas con más propiedades")).toBe(true);
  });

  it("sin órdenes muestra los indicadores en cero", () => {
    window.localStorage.setItem("aura_ordenes", "[]");                      // dejamos las órdenes vacías
    renderizar(<Reportes />);
    expect(store.getOrdenes().length).toBe(0);
    expect(hayTexto("0%")).toBe(true);                                      // tasa de aprobación
    expect(hayTexto("$0")).toBe(true);                                      // ingresos y ticket promedio
  });
});
