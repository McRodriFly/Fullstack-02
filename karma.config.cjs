/* =========================================================
   CONFIGURACIÓN DE KARMA (entorno de pruebas)
   - Jasmine: framework de pruebas (describe/it/expect/spies)
   - karma-esbuild: transpila JSX y módulos ESM de React
   - esbuild-plugin-istanbul: instrumenta el código de src/
     para medir cobertura (qué líneas ejecutan las pruebas)
   - karma-coverage: genera el reporte de cobertura
   - ChromeHeadless: navegador real sin ventana (DOM real)
   Uso: npm test  →  reporte HTML en coverage/index.html
========================================================= */
const { esbuildPluginIstanbul } = require("esbuild-plugin-istanbul");

// Instrumenta solo el código de la app (src/), dejando fuera las pruebas
// (src/tests/). El plugin ya ignora node_modules. La opción de JSX para
// el instrumentador está en .nycrc.json (parserPlugins: ["jsx"]).
const ES_PRUEBA = /[\\/]src[\\/]tests[\\/]/;

function soloCodigoApp(plugin) {
  return {
    name: plugin.name,
    setup(build) {
      // Envolvemos onLoad: si el archivo es una prueba, no se instrumenta
      return plugin.setup({
        ...build,
        onLoad: (opciones, callback) =>
          build.onLoad(opciones, (args) => (ES_PRUEBA.test(args.path) ? undefined : callback(args))),
      });
    },
  };
}

const istanbulJs = soloCodigoApp(
  esbuildPluginIstanbul({ filter: /[\\/]src[\\/].*\.js$/, loader: "jsx", name: "istanbul-js" })
);
const istanbulJsx = soloCodigoApp(
  esbuildPluginIstanbul({ filter: /[\\/]src[\\/].*\.jsx$/, loader: "jsx", name: "istanbul-jsx" })
);

module.exports = function (config) {
  config.set({
    // Framework de pruebas
    frameworks: ["jasmine"],

    files: [
      // Archivos de prueba (specs)
      { pattern: "src/tests/*.spec.js", watched: false },
      // Imágenes de public/ servidas por Karma (evita errores 404 en <img>)
      { pattern: "public/img/*", watched: false, included: false, served: true },
    ],

    // Las rutas /img/... de los componentes apuntan a public/img
    proxies: { "/img/": "/base/public/img/" },

    // karma-esbuild transpila los specs (JSX, imports ESM) al vuelo
    preprocessors: {
      "src/tests/*.spec.js": ["esbuild"],
    },

    plugins: [
      "karma-jasmine",
      "karma-esbuild",
      "karma-chrome-launcher",
      "karma-coverage",
    ],

    // Opciones de esbuild: JSX automático de React 19 + instrumentación
    esbuild: {
      jsx: "automatic",
      target: "es2020",
      define: { IS_REACT_ACT_ENVIRONMENT: "true" },
      loader: { ".js": "jsx", ".jsx": "jsx" },
      plugins: [istanbulJs, istanbulJsx],
    },

    browsers: ["ChromeHeadless"],

    // progress: avance de pruebas · coverage: reporte de cobertura
    reporters: ["progress", "coverage"],

    coverageReporter: {
      dir: "coverage",
      reporters: [
        { type: "html", subdir: "." },        // reporte navegable
        { type: "text-summary" },             // resumen en consola
        { type: "text" },                     // detalle por archivo en consola
      ],
      // Umbral mínimo: si la cobertura baja de esto, npm test falla
      check: {
        global: { statements: 80, branches: 70, functions: 80, lines: 80 },
      },
    },

    singleRun: true,
    autoWatch: false,
  });
};
