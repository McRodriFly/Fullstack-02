/* =========================================================
   CONFIGURACIÓN DE KARMA (entorno de pruebas)
   - Jasmine: framework de pruebas (describe/it/expect)
   - karma-esbuild: transpila JSX y módulos ESM de React
   - ChromeHeadless: navegador real sin ventana (DOM real)
   Uso: npm test
========================================================= */
module.exports = function (config) {
  config.set({
    // Framework de aserciones
    frameworks: ["jasmine"],

    // Archivos de prueba (specs)
    files: [{ pattern: "src/tests/*.spec.js", watched: false }],

    // karma-esbuild transpila los specs (JSX, imports ESM) al vuelo
    preprocessors: {
      "src/tests/*.spec.js": ["esbuild"],
    },

    plugins: [
      "karma-jasmine",
      "karma-esbuild",
      "karma-chrome-launcher",
    ],

    // Opciones de esbuild: JSX automático de React 19
    esbuild: {
      jsx: "automatic",
      target: "es2020",
      define: { IS_REACT_ACT_ENVIRONMENT: "true" },
      loader: { ".js": "jsx", ".jsx": "jsx" },
    },

    browsers: ["ChromeHeadless"],

    reporters: ["progress"],

    singleRun: true,
    autoWatch: false,
  });
};
