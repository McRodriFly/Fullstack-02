/* ProductCard: datos por props, precio de oferta condicional y callback onAgregar. */
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "../components/ProductCard";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(cleanup);

const productoNormal = {
  id: 3, nombre: "Gorra Negra Audi F1", categoria: "Gorras",
  precio: 35000, archivo: "Gorra1.jpeg", stock: 25, oferta: false, precioOferta: 0,
};

const productoOferta = {
  id: 4, nombre: "Gorra Edición Especial", categoria: "Gorras",
  precio: 40000, archivo: "Gorra2.jpeg", stock: 8, oferta: true, precioOferta: 32000,
};

// <Link> necesita un router.
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
    expect(container.querySelector(".text-decoration-line-through")).not.toBe(null);
    expect(screen.getByText("$32.000")).toBeTruthy();

    cleanup();
    let r = renderTarjeta({ producto: productoNormal, onAgregar: () => {} });
    expect(r.container.querySelector(".text-decoration-line-through")).toBe(null);
  });

  it("simulación de evento: al hacer clic en 'AÑADIR AL CARRITO' se llama onAgregar con el producto", () => {
    const spyAgregar = jasmine.createSpy("onAgregar");
    renderTarjeta({ producto: productoNormal, onAgregar: spyAgregar });

    fireEvent.click(screen.getByText("AÑADIR AL CARRITO"));

    expect(spyAgregar).toHaveBeenCalledTimes(1);
    expect(spyAgregar).toHaveBeenCalledWith(productoNormal, 35000);
  });
});
