/* Página temporal "en construcción": usada como placeholder mientras
   migramos cada vista en los siguientes pasos. Se reemplaza una a una. */
export default function PaginaSimple({ titulo }) {
  return (
    <section className="container py-5 text-center">
      <h1 className="fw-bold text-uppercase">{titulo}</h1>
      <p className="text-muted">🚧 Vista en migración a React 🚧</p>
    </section>
  );
}
