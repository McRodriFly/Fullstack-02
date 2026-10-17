/* =========================================================
   UTILIDADES COMPARTIDAS PARA LAS PRUEBAS
   - renderConTienda: monta un componente dentro de un router en
     memoria (MemoryRouter) y del CarritoProvider, igual que en la app.
   - guardarCarrito: deja productos "pre-cargados" en localStorage.
   - Productos de ejemplo reutilizables (datos de prueba / fixtures).
========================================================= */
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CarritoProvider } from "../context/CarritoContext";

// Necesario para que React sepa que corre dentro de pruebas (act)
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Producto sin oferta
export const gorra = {
  id: 3, nombre: "Gorra Negra Audi F1", categoria: "Gorras",
  precio: 35000, archivo: "Gorra1.jpeg", stock: 25, oferta: false, precioOferta: 0,
};

// Producto en oferta (precio ya rebajado, como lo guarda el carrito)
export const conjunto = {
  id: 2, nombre: "Conjunto Deportivo F1", categoria: "Ropa",
  precio: 69000, archivo: "Conjunto_1.jpeg", stock: 15, oferta: true, precioOferta: 69000,
};

// Deja el carrito guardado en localStorage antes de renderizar
export function guardarCarrito(productos) {
  localStorage.setItem("carritoTienda", JSON.stringify(productos));
}

// Renderiza "ui" con router en memoria (ruta inicial configurable) + carrito
export function renderConTienda(ui, ruta = "/") {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <CarritoProvider>{ui}</CarritoProvider>
    </MemoryRouter>
  );
}
