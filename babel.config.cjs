/* Configuración de Babel. SOLO la usan las pruebas (Karma + Webpack);
   Vite no la lee (usa su propio compilador para npm run dev / build).

   - preset-env: traduce JavaScript moderno para el navegador de pruebas.
   - preset-react: entiende JSX (<Componente />) sin importar React a mano.
   - istanbul: "instrumenta" el código para medir qué líneas se ejecutaron
     durante las pruebas (eso es la COBERTURA). Excluye las propias pruebas. */
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { chrome: "100" } }],
    ["@babel/preset-react", { runtime: "automatic" }]
  ],
  plugins: [
    ["istanbul", { exclude: ["src/tests/**", "**/*.spec.js", "**/*.spec.jsx"] }]
  ]
};
