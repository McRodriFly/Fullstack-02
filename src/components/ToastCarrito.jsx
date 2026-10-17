/* Notificación flotante al agregar productos. El mensaje y su temporizador
   viven en CarritoContext; este componente solo lo dibuja. */
import { useCarrito } from "../context/CarritoContext";

export default function ToastCarrito() {
  const { toast, cerrarToast } = useCarrito();

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
