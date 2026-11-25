/* Flujo de pago: validación por campo, pago aprobado, rechazado y cupón aplicado. */
import { screen, fireEvent, cleanup } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import Checkout from "../pages/Checkout";
import CompraExitosa from "../pages/CompraExitosa";
import CompraFallida from "../pages/CompraFallida";
import Carrito from "../pages/Carrito";
import { renderConTienda, guardarCarrito, gorra } from "./helpers";

function renderFlujo() {
  return renderConTienda(
    <Routes>
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/compra-exitosa" element={<CompraExitosa />} />
      <Route path="/compra-fallida" element={<CompraFallida />} />
    </Routes>,
    "/checkout"
  );
}

function llenarFormulario({ tarjeta = "4242 4242 4242 4242", entrega = "despacho" } = {}) {
  const valores = {
    nombre: "Carlos Sainz",
    correo: "carlos@gmail.com",
    direccion: "Av. Siempre Viva 123",
    ciudad: "Santiago",
    entrega,
    tarjeta,
    vencimiento: "12/28",
    cvv: "123",
  };
  Object.entries(valores).forEach(([id, value]) => {
    fireEvent.change(document.getElementById(id), { target: { value } });
  });
}

describe("Flujo de Checkout", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("sin productos muestra aviso de carrito vacío", () => {
    renderFlujo();
    expect(screen.getByText(/tu carrito está vacío/i)).toBeTruthy();
    expect(screen.queryByText("CONFIRMAR PAGO")).toBe(null);
  });

  it("al enviar vacío marca los 7 campos con error (is-invalid)", () => {
    guardarCarrito([gorra]);
    const { container } = renderFlujo();

    fireEvent.click(screen.getByText("CONFIRMAR PAGO"));

    expect(container.querySelectorAll(".is-invalid").length).toBe(7);
    expect(screen.getByText("La tarjeta debe tener 16 dígitos.")).toBeTruthy();
  });

  it("pago aprobado: navega a compra exitosa, muestra el resumen y vacía el carrito", () => {
    guardarCarrito([gorra]);
    renderFlujo();

    llenarFormulario();
    fireEvent.click(screen.getByText("CONFIRMAR PAGO"));

    expect(screen.getByText("¡COMPRA EXITOSA!")).toBeTruthy();
    expect(screen.getByText(/Carlos Sainz/)).toBeTruthy();
    expect(screen.getByText(/Despacho a Av. Siempre Viva 123, Santiago/)).toBeTruthy();
    expect(localStorage.getItem("carritoTienda")).toBe(null);
  });

  it("pago aprobado con retiro en tienda lo indica en el resumen", () => {
    guardarCarrito([gorra]);
    renderFlujo();

    llenarFormulario({ entrega: "retiro" });
    fireEvent.click(screen.getByText("CONFIRMAR PAGO"));

    expect(screen.getByText("Retiro en tienda")).toBeTruthy();
  });

  it("el cupón aplicado en el carrito se mantiene en el resumen del checkout", () => {
    guardarCarrito([gorra]);
    renderConTienda(
      <Routes>
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>,
      "/carrito"
    );
    fireEvent.change(document.getElementById("cupon"), { target: { value: "F1AUDI" } });
    fireEvent.click(screen.getByText("APLICAR"));
    fireEvent.click(screen.getByText("PAGAR"));

    expect(screen.getByText("CHECKOUT")).toBeTruthy();
    expect(screen.getByText("Descuento (10%):")).toBeTruthy();
    expect(screen.getByText("$31.500")).toBeTruthy();
  });

  it("pago rechazado (tarjeta 4000…0002): muestra la vista fallida y conserva el carrito", () => {
    guardarCarrito([gorra]);
    renderFlujo();

    llenarFormulario({ tarjeta: "4000000000000002" });
    fireEvent.click(screen.getByText("CONFIRMAR PAGO"));

    expect(screen.getByText("NO SE PUDO REALIZAR EL PAGO")).toBeTruthy();
    expect(screen.getByText(/Referencia: AUF1-/)).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("carritoTienda")).length).toBe(1);
  });
});
