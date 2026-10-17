/* =========================================================
   PRUEBAS DE LA VISTA Carrito (/carrito)
   Abarca: renderizado condicional (vacío / con productos),
   cupones con feedback, eliminar ítems, totales en el DOM
   y navegación al checkout.
========================================================= */
import { screen, fireEvent, cleanup } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import Carrito from "../pages/Carrito";
import { renderConTienda, guardarCarrito, gorra, conjunto } from "./helpers";

function renderCarrito() {
  return renderConTienda(
    <Routes>
      <Route path="/carrito" element={<Carrito />} />
      <Route path="/checkout" element={<h1>Pantalla de checkout</h1>} />
    </Routes>,
    "/carrito"
  );
}

describe("Vista Carrito", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("muestra el mensaje de carrito vacío y avisa si se intenta pagar", () => {
    renderCarrito();
    expect(screen.getByText(/tu carrito está vacío/i)).toBeTruthy();

    fireEvent.click(screen.getByText("PAGAR"));

    // En vez de alert() ahora aparece un aviso dentro de la página
    expect(screen.getByRole("alert").textContent).toContain("Agrega productos antes de pagar");
  });

  it("lista los productos y calcula el subtotal en pantalla", () => {
    guardarCarrito([gorra, conjunto]);
    renderCarrito();

    expect(screen.getByText("Gorra Negra Audi F1")).toBeTruthy();
    expect(screen.getByTestId("subtotal-carrito").textContent).toBe("$104.000");
    expect(screen.getByTestId("total-carrito").textContent).toBe("$104.000");
  });

  it("aplica un cupón válido: muestra la línea de descuento y actualiza el total", () => {
    guardarCarrito([gorra]);
    renderCarrito();

    fireEvent.change(document.getElementById("cupon"), { target: { value: "F1AUDI" } });
    fireEvent.click(screen.getByText("APLICAR"));

    expect(screen.getByText(/aplicado correctamente/i)).toBeTruthy();
    expect(screen.getByText("Descuento (10%):")).toBeTruthy();
    expect(screen.getByTestId("total-carrito").textContent).toBe("$31.500");
  });

  it("informa cuando el cupón no es válido o el carrito está vacío", () => {
    renderCarrito();
    fireEvent.click(screen.getByText("APLICAR"));
    expect(screen.getByText(/agrega productos antes de aplicar/i)).toBeTruthy();

    cleanup();
    guardarCarrito([gorra]);
    renderCarrito();
    fireEvent.change(document.getElementById("cupon"), { target: { value: "FALSO" } });
    fireEvent.click(screen.getByText("APLICAR"));
    expect(screen.getByText(/no es válido/i)).toBeTruthy();
  });

  it("elimina un producto al presionar ELIMINAR", () => {
    guardarCarrito([gorra, conjunto]);
    renderCarrito();

    fireEvent.click(screen.getAllByText(/ELIMINAR/)[0]);

    expect(screen.queryByText("Gorra Negra Audi F1")).toBe(null);
    expect(screen.getByTestId("subtotal-carrito").textContent).toBe("$69.000");
  });

  it("con productos, PAGAR navega a /checkout", () => {
    guardarCarrito([gorra]);
    renderCarrito();
    fireEvent.click(screen.getByText("PAGAR"));
    expect(screen.getByText("Pantalla de checkout")).toBeTruthy();
  });
});
