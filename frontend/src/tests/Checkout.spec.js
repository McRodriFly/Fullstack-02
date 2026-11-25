/* Flujo de pago contra un backend simulado: validación por campo, compra registrada
   (POST /boletas), pago rechazado en la pasarela, errores del backend y cupón. */
import { screen, fireEvent, cleanup } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import Checkout from "../pages/Checkout";
import CompraExitosa from "../pages/CompraExitosa";
import CompraFallida from "../pages/CompraFallida";
import Carrito from "../pages/Carrito";
import {
  renderConTienda, guardarCarrito, gorra, conjunto, guardarSesionDePrueba, USUARIOS, errorApi,
  respuestaJson, simularBackend,
} from "./helpers";

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

// Boleta que devuelve el backend: el total es el que calculó el servidor.
function boleta(extra = {}) {
  return {
    id: 25, usuarioId: 3, estado: "PAGADA", subtotal: 35000, descuento: 0, total: 35000,
    cuponCodigo: null, tipoEntrega: "DESPACHO",
    detalles: [{ productoId: 3, productoNombre: "Gorra Negra Audi F1", cantidad: 1, precioUnitario: 35000, subtotal: 35000 }],
    ...extra,
  };
}

describe("Flujo de Checkout", () => {
  beforeEach(() => {
    localStorage.clear();
    guardarSesionDePrueba(USUARIOS.cliente);
  });
  afterEach(cleanup);

  it("sin productos muestra aviso de carrito vacío", () => {
    renderFlujo();
    expect(screen.getByText(/tu carrito está vacío/i)).toBeTruthy();
    expect(screen.queryByText("CONFIRMAR PAGO")).toBe(null);
  });

  it("adelanta el nombre y el correo de la cuenta con sesión", () => {
    guardarCarrito([gorra]);
    renderFlujo();

    expect(document.getElementById("nombre").value).toBe("Cliente");
    expect(document.getElementById("correo").value).toBe("cliente@gmail.com");
  });

  it("al enviar vacío marca los campos con error (is-invalid) y no llama al backend", () => {
    guardarCarrito([gorra]);
    const fetch = simularBackend({});
    const { container } = renderFlujo();
    // Los datos de la cuenta ya vienen escritos: se borran para ver los 7 errores.
    fireEvent.change(document.getElementById("nombre"), { target: { value: "" } });
    fireEvent.change(document.getElementById("correo"), { target: { value: "" } });

    fireEvent.click(screen.getByText("CONFIRMAR PAGO"));

    expect(container.querySelectorAll(".is-invalid").length).toBe(7);
    expect(screen.getByText("La tarjeta debe tener 16 dígitos.")).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("pago aprobado: registra la compra, muestra el pedido del servidor y vacía el carrito", async () => {
    guardarCarrito([gorra]);
    let enviado;
    simularBackend({
      "POST /boletas": ({ cuerpo, token }) => {
        enviado = { cuerpo, token };
        return respuestaJson(201, boleta());
      },
    });
    renderFlujo();

    llenarFormulario();
    fireEvent.click(screen.getByText("CONFIRMAR PAGO"));

    expect(await screen.findByText("¡COMPRA EXITOSA!")).toBeTruthy();
    expect(screen.getByText(/Carlos Sainz/)).toBeTruthy();
    expect(screen.getByText(/Despacho a Av. Siempre Viva 123, Santiago/)).toBeTruthy();
    expect(screen.getByText("AUF1-000025")).toBeTruthy();
    expect(localStorage.getItem("carritoTienda")).toBe(null);
    // La compra viaja con el token de la sesión y sin precios.
    expect(enviado.token).toBeTruthy();
    expect(enviado.cuerpo).toEqual({
      items: [{ productoId: 3, cantidad: 1 }],
      tipoEntrega: "DESPACHO",
      direccionEnvio: "Av. Siempre Viva 123",
      ciudad: "Santiago",
      cuponCodigo: null,
    });
  });

  it("los productos repetidos del carrito viajan como una sola línea con su cantidad", async () => {
    guardarCarrito([gorra, conjunto, gorra]);
    let enviado;
    simularBackend({
      "POST /boletas": ({ cuerpo }) => {
        enviado = cuerpo;
        return respuestaJson(201, boleta({
          detalles: [
            { productoId: 2, cantidad: 1, precioUnitario: 69000, subtotal: 69000 },
            { productoId: 3, cantidad: 2, precioUnitario: 35000, subtotal: 70000 },
          ],
          total: 139000,
        }));
      },
    });
    renderFlujo();

    llenarFormulario();
    fireEvent.click(screen.getByText("CONFIRMAR PAGO"));

    expect(await screen.findByText("¡COMPRA EXITOSA!")).toBeTruthy();
    expect(enviado.items).toEqual([{ productoId: 3, cantidad: 2 }, { productoId: 2, cantidad: 1 }]);
    // Productos y total salen de lo que registró el servidor.
    expect(screen.getByText("3", { selector: "p" })).toBeTruthy();
    expect(screen.getByText("$139.000")).toBeTruthy();
  });

  it("pago aprobado con retiro en tienda lo envía y lo indica en el resumen", async () => {
    guardarCarrito([gorra]);
    let enviado;
    simularBackend({
      "POST /boletas": ({ cuerpo }) => {
        enviado = cuerpo;
        return respuestaJson(201, boleta({ tipoEntrega: "RETIRO" }));
      },
    });
    renderFlujo();

    llenarFormulario({ entrega: "retiro" });
    fireEvent.click(screen.getByText("CONFIRMAR PAGO"));

    // "Retiro en tienda" también es una opción del formulario: se espera la página nueva.
    expect(await screen.findByText("¡COMPRA EXITOSA!")).toBeTruthy();
    expect(screen.getByText("Retiro en tienda", { selector: "p" })).toBeTruthy();
    expect(enviado.tipoEntrega).toBe("RETIRO");
  });

  it("mientras el backend registra la compra deshabilita el botón", async () => {
    guardarCarrito([gorra]);
    simularBackend({ "POST /boletas": () => new Promise(() => {}) });
    renderFlujo();

    llenarFormulario();
    fireEvent.click(screen.getByText("CONFIRMAR PAGO"));

    expect((await screen.findByText("PROCESANDO...")).disabled).toBe(true);
  });

  it("sin stock: muestra el motivo del backend, conserva el carrito y permite reintentar", async () => {
    guardarCarrito([gorra]);
    simularBackend({
      "POST /boletas": () => errorApi(409, "Stock insuficiente de Gorra Negra Audi F1: quedan 0 unidades"),
    });
    renderFlujo();

    llenarFormulario();
    fireEvent.click(screen.getByText("CONFIRMAR PAGO"));

    expect(await screen.findByText(/Stock insuficiente de Gorra Negra Audi F1/)).toBeTruthy();
    expect(screen.queryByText("¡COMPRA EXITOSA!")).toBe(null);
    expect(JSON.parse(localStorage.getItem("carritoTienda")).length).toBe(1);
    expect(screen.getByText("CONFIRMAR PAGO").disabled).toBe(false);
  });

  it("un error de validación del backend muestra también los campos con problema", async () => {
    guardarCarrito([gorra]);
    simularBackend({
      "POST /boletas": () => errorApi(400, "Hay datos inválidos en la solicitud", ["ciudad: tamaño inválido"]),
    });
    renderFlujo();

    llenarFormulario();
    fireEvent.click(screen.getByText("CONFIRMAR PAGO"));

    expect(await screen.findByText("Hay datos inválidos en la solicitud: ciudad: tamaño inválido")).toBeTruthy();
  });

  it("al reintentar tras un error, el aviso anterior se limpia", async () => {
    guardarCarrito([gorra]);
    let intentos = 0;
    simularBackend({
      "POST /boletas": () => (++intentos === 1 ? errorApi(409, "Sin stock") : respuestaJson(201, boleta())),
    });
    renderFlujo();
    llenarFormulario();

    fireEvent.click(screen.getByText("CONFIRMAR PAGO"));
    expect(await screen.findByText("Sin stock")).toBeTruthy();

    fireEvent.click(screen.getByText("CONFIRMAR PAGO"));
    expect(await screen.findByText("¡COMPRA EXITOSA!")).toBeTruthy();
  });

  it("el cupón aplicado en el carrito viaja al backend y se mantiene en el resumen", async () => {
    guardarCarrito([gorra]);
    let enviado;
    simularBackend({
      "POST /boletas": ({ cuerpo }) => {
        enviado = cuerpo;
        return respuestaJson(201, boleta({ descuento: 3500, total: 31500, cuponCodigo: "F1AUDI" }));
      },
    });
    renderConTienda(
      <Routes>
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/compra-exitosa" element={<CompraExitosa />} />
      </Routes>,
      "/carrito"
    );
    fireEvent.change(document.getElementById("cupon"), { target: { value: "f1audi" } });
    fireEvent.click(screen.getByText("APLICAR"));
    fireEvent.click(screen.getByText("PAGAR"));

    expect(screen.getByText("CHECKOUT")).toBeTruthy();
    expect(screen.getByText("Descuento (10%):")).toBeTruthy();
    expect(screen.getByText("$31.500")).toBeTruthy();

    llenarFormulario();
    fireEvent.click(screen.getByText("CONFIRMAR PAGO"));

    expect(await screen.findByText("¡COMPRA EXITOSA!")).toBeTruthy();
    expect(enviado.cuponCodigo).toBe("F1AUDI");
    expect(screen.getByText("$31.500")).toBeTruthy();
  });

  it("pago rechazado (tarjeta 4000…0002): muestra la vista fallida, conserva el carrito y no toca el backend", () => {
    guardarCarrito([gorra]);
    const fetch = simularBackend({});
    renderFlujo();

    llenarFormulario({ tarjeta: "4000000000000002" });
    fireEvent.click(screen.getByText("CONFIRMAR PAGO"));

    expect(screen.getByText("NO SE PUDO REALIZAR EL PAGO")).toBeTruthy();
    expect(screen.getByText(/Referencia: AUF1-/)).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("carritoTienda")).length).toBe(1);
    expect(fetch).not.toHaveBeenCalled();
  });
});
