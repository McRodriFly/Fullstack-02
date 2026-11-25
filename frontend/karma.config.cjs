/* Pruebas unitarias: Jasmine sobre Chrome Headless, specs transpilados con
   esbuild y cobertura con Istanbul (reporte en coverage/index.html). */
const { esbuildPluginIstanbul } = require("esbuild-plugin-istanbul");

// Instrumenta solo src/ y deja fuera src/tests/. El plugin ya ignora node_modules;
// el soporte de JSX del instrumentador está en .nycrc.json (parserPlugins).
const ES_PRUEBA = /[\\/]src[\\/]tests[\\/]/;

function soloCodigoApp(plugin) {
  return {
    name: plugin.name,
    setup(build) {
      // esbuild no acepta lookahead en los filtros, así que las pruebas se excluyen aquí.
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
    frameworks: ["jasmine"],

    files: [
      { pattern: "src/tests/*.spec.js", watched: false },
      // Se sirven pero no se cargan como script; evita 404 en los <img> renderizados.
      { pattern: "public/img/*", watched: false, included: false, served: true },
    ],

    // Karma sirve los archivos bajo /base/; los componentes piden /img/...
    proxies: { "/img/": "/base/public/img/" },

    preprocessors: {
      "src/tests/*.spec.js": ["esbuild"],
    },

    plugins: [
      "karma-jasmine",
      "karma-esbuild",
      "karma-chrome-launcher",
      "karma-coverage",
    ],

    esbuild: {
      jsx: "automatic",
      target: "es2020",
      // IS_REACT_ACT_ENVIRONMENT no se fija aquí: lo activa cada spec en globalThis
      // (ver helpers.js) para que Testing Library pueda apagarlo mientras espera
      // en findBy*/waitFor. import.meta.env no existe fuera de Vite.
      define: { "import.meta.env": "{}" },
      loader: { ".js": "jsx", ".jsx": "jsx" },
      plugins: [istanbulJs, istanbulJsx],
    },

    browsers: ["ChromeHeadless"],

    reporters: ["progress", "coverage"],

    coverageReporter: {
      dir: "coverage",
      reporters: [
        { type: "html", subdir: "." },
        { type: "text-summary" },
        { type: "text" },
      ],
      // npm test falla si la cobertura global baja del 90 % o si un archivo crítico
      // (sesión, cliente HTTP, contextos, hooks, guardia de rutas, validaciones y roles)
      // baja del 100 %.
      check: {
        global: { statements: 90, branches: 90, functions: 90, lines: 90 },
        each: {
          statements: 0, branches: 0, functions: 0, lines: 0,
          overrides: {
            "src/services/**/*.js": { statements: 100, branches: 100, functions: 100, lines: 100 },
            "src/context/**/*.jsx": { statements: 100, branches: 100, functions: 100, lines: 100 },
            "src/utils/**/*.js": { statements: 100, branches: 100, functions: 100, lines: 100 },
            "src/hooks/**/*.js": { statements: 100, branches: 100, functions: 100, lines: 100 },
            "src/components/RutaProtegida.jsx": { statements: 100, branches: 100, functions: 100, lines: 100 },
          },
        },
      },
    },

    singleRun: true,
    autoWatch: false,
  });
};
