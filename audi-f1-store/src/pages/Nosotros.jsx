/* Vista Nosotros: contenido institucional migrado de la EP1. */
export default function Nosotros() {
  return (
    <section className="container py-5">
      <div className="row align-items-center mb-5">
        <div className="col-md-6">
          <h2 className="fw-bold mb-4 text-uppercase">Nuestra Historia en la Pista</h2>
          <p className="text-muted">
            El proyecto Audi Formula 1 marca un hito histórico en el automovilismo
            mundial. Con nuestro ingreso oficial programado para 2026, estamos
            combinando la legendaria ingeniería alemana de Neuburg an der Donau
            con el espíritu competitivo más grande del planeta.
          </p>
          <p className="text-muted">
            Nuestra tienda oficial nace para conectar a los fanáticos con el equipo,
            ofreciendo merchandising auténtico, diseñado con los mismos estándares
            de calidad y precisión con los que desarrollamos nuestra unidad de
            potencia V6 híbrida.
          </p>
        </div>
        <div className="col-md-6 text-center">
          <img
            src="/img/Conjunto_1.jpeg"
            className="img-fluid border shadow-sm"
            alt="Historia Audi F1"
          />
        </div>
      </div>

      <div className="mb-5">
        <h3 className="fw-bold mb-4 text-uppercase">El proyecto en video</h3>
        <div className="ratio ratio-16x9 border shadow-sm">
          <iframe
            src="https://www.youtube.com/embed/2CQYoeWDgZU"
            title="Audi joins Formula 1 - Proyecto 2026"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <p className="text-muted mt-2 small">Video oficial del equipo Audi F1.</p>
      </div>
    </section>
  );
}
