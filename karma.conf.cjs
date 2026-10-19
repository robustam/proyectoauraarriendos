/* =====================================================================
   Configuración de Karma (el "corredor" de pruebas).

   ¿Qué hace Karma?
   1. Toma cada archivo de prueba (*.spec.js / *.spec.jsx) de src/tests.
   2. Lo compila con Webpack + Babel (para entender JSX e imports).
   3. Abre un navegador Chrome sin ventana (ChromeHeadless).
   4. Ejecuta ahí las pruebas escritas con Jasmine (describe / it / expect).
   5. Muestra el resultado en la terminal y genera el informe de cobertura
      en la carpeta coverage/ (abre coverage/html/index.html).

   Comando:  npm test            (corre una vez y termina)
             npm run test:watch  (se queda mirando cambios)
   ===================================================================== */

module.exports = function (config) {
  config.set({
    /* Frameworks: "jasmine" da describe/it/expect; "webpack" compila los archivos. */
    frameworks: ["jasmine", "webpack"],

    /* Archivos que se cargan en el navegador: solo las pruebas.
       Cada prueba importa por su cuenta los componentes que necesita. */
    files: [
      { pattern: "src/tests/**/*.spec.js", watched: false },
      { pattern: "src/tests/**/*.spec.jsx", watched: false }
    ],

    /* Antes de enviarlos al navegador, cada archivo pasa por Webpack. */
    preprocessors: {
      "src/tests/**/*.spec.js": ["webpack"],
      "src/tests/**/*.spec.jsx": ["webpack"]
    },

    /* Configuración mínima de Webpack solo para las pruebas. */
    webpack: {
      mode: "development",
      devtool: "inline-source-map",
      resolve: { extensions: [".js", ".jsx"] },
      module: {
        rules: [
          {
            /* Todos los .js y .jsx del proyecto pasan por Babel (ver babel.config.cjs). */
            test: /\.jsx?$/,
            exclude: /node_modules/,
            /* CORRECCIÓN: el proyecto es "type": "module" (package.json). En ese modo
               Webpack exige escribir la extensión en cada import ("../services/store.js").
               Con fullySpecified: false acepta "../services/store", igual que Vite. */
            resolve: { fullySpecified: false },
            use: { loader: "babel-loader" }
          },
          {
            /* Si algún componente importara un .css, en las pruebas se ignora. */
            test: /\.css$/,
            type: "asset/source"
          }
        ]
      }
    },

    /* Cómo se muestran los resultados:
       - progress: avance en la terminal.
       - kjhtml: reporte visual en el navegador (solo en modo watch).
       - coverage: informe de cobertura de código. */
    reporters: ["progress", "kjhtml", "coverage"],

    /* Informe de cobertura: HTML navegable + resumen en la terminal. */
    coverageReporter: {
      dir: "coverage/",
      reporters: [
        { type: "html", subdir: "html" },
        { type: "text-summary" },
        { type: "lcovonly", subdir: ".", file: "lcov.info" }
      ],
      /* Umbral mínimo: si la cobertura baja de estos porcentajes, `npm test`
         termina con error. Quedan un poco bajo lo medido (84,9 / 74,8 / 83,1 / 88,9)
         para no fallar por cambios pequeños, pero impiden que la cobertura retroceda. */
      check: {
        global: { statements: 80, branches: 70, functions: 78, lines: 85 }
      }
    },

    client: {
      clearContext: false, /* deja visible el reporte de Jasmine en el navegador */
      jasmine: { random: false } /* ejecuta las pruebas en el orden en que están escritas */
    },

    browsers: ["ChromeHeadless"], /* Chrome sin ventana; requiere Google Chrome instalado */
    singleRun: false,
    restartOnFileChange: true
  });
};