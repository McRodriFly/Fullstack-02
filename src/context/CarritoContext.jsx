/* =========================================================
   CONTEXTO DEL CARRITO (estado global)
   Reemplaza la lógica de js/carrito.js de la EP1.
   Usa createContext + useState para compartir el carrito
   entre el Navbar (contador) y las páginas (catálogo, carrito).
========================================================= */
import { createContext, useContext, useEffect, useState } from "react";

// Contexto de React: permite que cualquier componente lea/modifique el carrito
const CarritoContext = createContext();

// Cupones válidos migrados desde la EP1
const CUPONES = { F1AUDI: 10, NEUBURG2026: 15 };

// Provider: envuelve la app y entrega el estado del carrito a todos los hijos
export function CarritoProvider({ children }) {
  // Estado inicial: lee el carrito guardado en localStorage (persistencia EP1)
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem("carritoTienda");
    return guardado ? JSON.parse(guardado) : [];
  });
  const [descuento, setDescuento] = useState(0);
  // Mensaje del toast flotante (null = oculto). Reemplaza los alert() de la EP1.
  const [toast, setToast] = useState(null);

  // El toast se oculta solo a los 2,5 segundos
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Guarda el carrito cada vez que cambia
  function persistir(nuevoCarrito) {
    setCarrito(nuevoCarrito);
    localStorage.setItem("carritoTienda", JSON.stringify(nuevoCarrito));
  }

  // Agrega un producto (los ítems se apilan, igual que en la EP1)
  // y dispara el toast flotante de confirmación.
  function agregarAlCarrito(producto) {
    persistir([...carrito, producto]);
    setToast(`¡${producto.nombre} añadido al carrito!`);
  }

  // Cierra el toast manualmente (botón × del toast)
  function cerrarToast() {
    setToast(null);
  }

  // Elimina un ítem por su posición en el arreglo
  function eliminarDelCarrito(indice) {
    persistir(carrito.filter((_, i) => i !== indice));
  }

  // Valida un cupón y aplica el descuento. Devuelve true si era válido.
  function aplicarCupon(codigo) {
    const limpio = codigo.trim().toUpperCase();
    if (CUPONES[limpio]) {
      setDescuento(CUPONES[limpio]);
      return true;
    }
    setDescuento(0);
    return false;
  }

  // Vacía el carrito (después de pagar)
  function vaciarCarrito() {
    persistir([]);
    setDescuento(0);
    localStorage.removeItem("carritoTienda");
  }

  // Totales calculados: subtotal bruto y total con descuento aplicado
  const subtotal = carrito.reduce((acc, p) => acc + p.precio, 0);
  const total = subtotal - Math.round((subtotal * descuento) / 100);

  const valor = {
    carrito,
    cantidad: carrito.length,
    subtotal,
    total,
    descuento,
    agregarAlCarrito,
    eliminarDelCarrito,
    aplicarCupon,
    vaciarCarrito,
    toast,
    cerrarToast,
  };

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

// Hook personalizado: sintaxis corta para consumir el contexto en componentes
export function useCarrito() {
  return useContext(CarritoContext);
}
