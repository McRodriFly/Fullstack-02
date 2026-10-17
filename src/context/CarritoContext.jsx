/* Estado global del carrito: ítems, cupón de descuento y toast de confirmación.
   El carrito se persiste en localStorage ("carritoTienda"); el descuento no,
   así que se pierde al recargar la página. */
import { createContext, useContext, useEffect, useState } from "react";

const CarritoContext = createContext();

// código → % de descuento
const CUPONES = { F1AUDI: 10, NEUBURG2026: 15 };

export function CarritoProvider({ children }) {
  // Inicializador perezoso: localStorage se lee solo en el primer render.
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem("carritoTienda");
    return guardado ? JSON.parse(guardado) : [];
  });
  const [descuento, setDescuento] = useState(0);
  // null = toast oculto
  const [toast, setToast] = useState(null);

  // El cleanup cancela el timer anterior si llega otro toast antes de los 2,5 s.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Toda modificación del carrito pasa por aquí para mantener estado y localStorage en sync.
  function persistir(nuevoCarrito) {
    setCarrito(nuevoCarrito);
    localStorage.setItem("carritoTienda", JSON.stringify(nuevoCarrito));
  }

  // Los repetidos se apilan como ítems separados (no hay campo cantidad).
  function agregarAlCarrito(producto) {
    persistir([...carrito, producto]);
    setToast(`¡${producto.nombre} añadido al carrito!`);
  }

  function cerrarToast() {
    setToast(null);
  }

  // Por índice y no por id: puede haber varios ítems del mismo producto.
  function eliminarDelCarrito(indice) {
    persistir(carrito.filter((_, i) => i !== indice));
  }

  // Devuelve true si el cupón existe. Uno inválido resetea el descuento a 0.
  function aplicarCupon(codigo) {
    const limpio = codigo.trim().toUpperCase();
    if (CUPONES[limpio]) {
      setDescuento(CUPONES[limpio]);
      return true;
    }
    setDescuento(0);
    return false;
  }

  function vaciarCarrito() {
    persistir([]);
    setDescuento(0);
    localStorage.removeItem("carritoTienda");
  }

  // Derivados del estado: se recalculan en cada render, no se guardan.
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

export function useCarrito() {
  return useContext(CarritoContext);
}
