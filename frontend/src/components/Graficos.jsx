/* Gráficos del dashboard dibujados con SVG y CSS, sin librerías externas.
   Todos reciben datos con la forma [{ etiqueta, valor }], un "formato" para mostrar los
   valores y el "textoVacio" que se muestra, en vez de un gráfico vacío, si no hay nada que graficar.
   Cada gráfico tiene texto alternativo (aria-label) y un <title> por barra o porción. */

const COLORES = ["#b00020", "#212529", "#6c757d", "#f0a8b0", "#ced4da", "#7d1128"];

function SinDatos({ texto }) {
  return (
    <p className="text-muted small mb-0 py-4 text-center" data-testid="grafico-vacio">
      {texto}
    </p>
  );
}

/* Barras verticales: una por etiqueta (por ejemplo, un día), con su valor encima. */
export function BarrasVerticales({ datos, formato, descripcion, textoVacio }) {
  const maximo = Math.max(0, ...datos.map((d) => d.valor));
  if (maximo === 0) return <SinDatos texto={textoVacio} />;

  const ANCHO = 420;
  const ALTO_BARRAS = 130;
  const BASE = 160;
  const paso = ANCHO / datos.length;
  const anchoBarra = paso * 0.6;

  return (
    <svg viewBox={`0 0 ${ANCHO} 184`} className="w-100" role="img" aria-label={descripcion} data-testid="barras-verticales">
      <line x1="0" y1={BASE} x2={ANCHO} y2={BASE} stroke="#adb5bd" strokeWidth="1" />
      {datos.map((d, i) => {
        const alto = (d.valor / maximo) * ALTO_BARRAS;
        const x = i * paso + (paso - anchoBarra) / 2;
        return (
          <g key={d.etiqueta}>
            <title>{`${d.etiqueta}: ${formato(d.valor)}`}</title>
            <rect x={x} y={BASE - alto} width={anchoBarra} height={alto} fill={COLORES[0]} rx="2" />
            {d.valor > 0 && (
              <text x={x + anchoBarra / 2} y={BASE - alto - 5} textAnchor="middle" fontSize="10" fill="#212529">
                {formato(d.valor)}
              </text>
            )}
            <text x={x + anchoBarra / 2} y={BASE + 16} textAnchor="middle" fontSize="11" fill="#6c757d">
              {d.etiqueta}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* Barras horizontales: una fila por etiqueta, con el largo proporcional al mayor valor. */
export function BarrasHorizontales({ datos, formato, descripcion, textoVacio }) {
  const maximo = Math.max(0, ...datos.map((d) => d.valor));
  if (maximo === 0) return <SinDatos texto={textoVacio} />;

  return (
    <div role="img" aria-label={descripcion} data-testid="barras-horizontales">
      {datos.map((d) => (
        <div key={d.etiqueta} className="mb-3">
          <div className="d-flex justify-content-between small mb-1">
            <span className="fw-bold text-truncate me-2">{d.etiqueta}</span>
            <span className="text-muted text-nowrap">{formato(d.valor)}</span>
          </div>
          <div className="progress rounded-0" style={{ height: "10px" }}>
            <div
              className="progress-bar"
              style={{ width: `${(d.valor / maximo) * 100}%`, backgroundColor: COLORES[0] }}
              title={`${d.etiqueta}: ${formato(d.valor)}`}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* Dona: cada porción es un círculo con trazo discontinuo; con r = 15,9155 la
   circunferencia mide 100 y el largo del trazo es directamente el porcentaje. */
export function Dona({ datos, formato, descripcion, textoVacio }) {
  const total = datos.reduce((suma, d) => suma + d.valor, 0);
  if (total === 0) return <SinDatos texto={textoVacio} />;

  // El trazo de cada porción arranca (desde las 12 en punto: 25) donde terminó la anterior.
  const porciones = datos.map((d, i) => {
    const antes = datos.slice(0, i).reduce((suma, x) => suma + x.valor, 0);
    return {
      ...d,
      porcentaje: (d.valor / total) * 100,
      desplazamiento: 25 - (antes / total) * 100,
      color: COLORES[i % COLORES.length],
    };
  });

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-center gap-4" data-testid="dona">
      <svg viewBox="0 0 42 42" width="160" height="160" role="img" aria-label={descripcion}>
        <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#e9ecef" strokeWidth="6" />
        {porciones
          .filter((p) => p.valor > 0)
          .map((p) => (
            <circle
              key={p.etiqueta}
              cx="21" cy="21" r="15.9155" fill="none" stroke={p.color} strokeWidth="6"
              strokeDasharray={`${p.porcentaje} ${100 - p.porcentaje}`}
              strokeDashoffset={p.desplazamiento}
            >
              <title>{`${p.etiqueta}: ${formato(p.valor)} (${Math.round(p.porcentaje)} %)`}</title>
            </circle>
          ))}
      </svg>
      <ul className="list-unstyled mb-0 small">
        {porciones.map((p) => (
          <li key={p.etiqueta} className="d-flex align-items-center mb-1">
            <span
              className="d-inline-block me-2"
              style={{ width: "12px", height: "12px", backgroundColor: p.color }}
            ></span>
            <span className="me-2">{p.etiqueta}</span>
            <span className="text-muted">{formato(p.valor)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
