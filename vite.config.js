/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/* Configuración de Vite (npm run dev / npm run build) y de Vitest (npm test).
   Vitest usa la MISMA configuración de Vite: entiende JSX, los imports y las
   imágenes igual que la aplicación, sin Webpack ni Babel aparte. */
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  test: {
    /* jsdom simula el navegador (document, window, localStorage) dentro de Node. */
    environment: "jsdom",
    /* describe / it / expect disponibles sin importarlos, igual que antes con Jasmine. */
    globals: true,
    /* Solo los archivos de prueba de la carpeta tests/. */
    include: ["tests/**/*.spec.{js,jsx}"],
    /* Después de cada prueba se quitan los espías (vi.spyOn), para que no se mezclen. */
    restoreMocks: true,
    /* Informe de cobertura con V8: resumen en la terminal + HTML en coverage/index.html.
       Se mide el código de src/ que las pruebas ejecutan; si baja del mínimo, npm test falla. */
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "html", "lcov"],
      reportsDirectory: "coverage",
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/main.jsx"],
      all: false,
      thresholds: { statements: 80, branches: 70, functions: 75, lines: 80 }
    }
  }
});
