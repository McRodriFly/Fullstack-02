/* =========================================================
   PRUEBAS DEL COMPONENTE ProductCard (React)
   Abarca: renderizado correcto, props recibidas, renderizado
   condicional (oferta) y simulación de eventos con mock (spy).
   Se usa React Testing Library dentro de Karma + Chrome real.
========================================================= */
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "../components/ProductCard";

// Necesario para que React Testing Library detecte el entorno de pruebas
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(cleanup);

// Producto de prueba SIN oferta
const productoNormal = {
  id: 3, nombre: "Gorra Negra Audi F1", categoria: "Gorras",
  precio: 35000, archivo: "Gorra1.jpeg", stock: 25, oferta: false, precioOferta: 0,
};

// Producto de prueba EN oferta
const productoOferta = {
  id: 4, nombre: "Gorra Edición Especial", categoria: "Gorras",
  precio: 40000, archivo: "Gorra2.jpeg", stock: 8, oferta: true, precioOferta: 32000,
};

// El componente usa <Link>, así que lo envolvemos en MemoryRouter
function renderTarjeta(props) {
  return render(
    <MemoryRouter>
      <ProductCard {...props} />
    </MemoryRouter>
  );
}

describe("Componente ProductCard", () => {
  it("renderiza con los datos entregados por props (nombre, categoría, precio)", () => {
    renderTarjeta({ producto: productoNormal, onAgregar: () => {} });
    expect(screen.getByText("Gorra Negra Audi F1")).toBeTruthy();
    expect(screen.getByText("Gorras")).toBeTruthy();
    expect(screen.getByText("$35.000")).toBeTruthy();
  });

  it("renderizado condicional: muestra precio tachado y rebajado SOLO en oferta", () => {
    const { container } = renderTarjeta({ producto: productoOferta, onAgregar: () => {} });
    // Precio original tachado visible
    expect(container.querySelector(".text-decoration-line-through")).not.toBe(null);
    expect(screen.getByText("$32.000")).toBeTruthy();

    cleanup();
    let r = renderTarjeta({ producto: productoNormal, onAgregar: () => {} });
    // Sin oferta: no hay precio tachado
    expect(r.container.querySelector(".text-decoration-line-through")).toBe(null);
  });

  it("simulación de evento: al hacer clic en 'AÑADIR AL CARRITO' se llama onAgregar con el producto", () => {
    // Mock (spy de Jasmine): simula la función sin ejecutarla de verdad
    const spyAgregar = jasmine.createSpy("onAgregar");
    renderTarjeta({ producto: productoNormal, onAgregar: spyAgregar });

    fireEvent.click(screen.getByText("AÑADIR AL CARRITO"));

    expect(spyAgregar).toHaveBeenCalledTimes(1);
    expect(spyAgregar).toHaveBeenCalledWith(productoNormal, 35000);
  });
});
