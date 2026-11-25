/* Utilidades compartidas por los specs: datos de prueba y un render que
   replica el árbol de la app (MemoryRouter + CarritoProvider). */
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CarritoProvider } from "../context/CarritoContext";

// Le indica a React que corre en un entorno de pruebas (habilita act()).
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

export const gorra = {
  id: 3, nombre: "Gorra Negra Audi F1", categoria: "Gorras",
  precio: 35000, archivo: "Gorra1.jpeg", stock: 25, oferta: false, precioOferta: 0,
};

// precio ya rebajado, tal como lo guarda el carrito
export const conjunto = {
  id: 2, nombre: "Conjunto Deportivo F1", categoria: "Ropa",
  precio: 69000, archivo: "Conjunto_1.jpeg", stock: 15, oferta: true, precioOferta: 69000,
};

export function guardarCarrito(productos) {
  localStorage.setItem("carritoTienda", JSON.stringify(productos));
}

export function renderConTienda(ui, ruta = "/") {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <CarritoProvider>{ui}</CarritoProvider>
    </MemoryRouter>
  );
}
