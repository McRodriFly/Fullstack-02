/* Toast flotante de confirmación al agregar productos.
   Reemplaza los alert() del navegador de la EP1:
   aparece abajo a la derecha y se oculta solo a los 2,5 s. */
import { useCarrito } from "../context/CarritoContext";

export default function ToastCarrito() {
  const { toast, cerrarToast } = useCarrito();

  // Renderizado condicional: sin mensaje no se muestra nada
  if (!toast) return null;

  return (
    <div className="toast-carrito" role="status">
      <span>✅ {toast}</span>
      <button
        type="button"
        className="toast-carrito-cerrar"
        onClick={cerrarToast}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
}
