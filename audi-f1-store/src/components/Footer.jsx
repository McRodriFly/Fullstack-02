/* Footer de la tienda: componente simple y reutilizable (misma marca EP1). */
export default function Footer() {
  return (
    <footer className="bg-dark text-white text-center py-4 mt-auto">
      <p className="mb-1 fw-bold">
        AUDI <span className="text-danger">F1</span> STORE
      </p>
      <p className="mb-0 text-secondary small">
        Merchandising oficial del equipo · {new Date().getFullYear()}
      </p>
    </footer>
  );
}
