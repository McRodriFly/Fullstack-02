/* Adaptadores de catálogo y ventas entre la forma del backend y la de las vistas. */
import {
  actualizarProducto, crearProducto, eliminarProducto, productoDesdeApi, productoParaApi, productosDesdeApi,
} from "../services/catalogo";
import { compraParaApi, crearBoleta } from "../services/ventas";
import { describirError, ErrorApi } from "../services/api";
import { formatearPrecio } from "../utils/formato";
import { gorra, conjunto, guardarSesionDePrueba, respuestaJson, simularBackend, USUARIOS, productosIniciales } from "./helpers";

describe("Catálogo: adaptadores", () => {
  it("el producto del backend pasa a la forma de las vistas (imagen → archivo)", () => {
    const [chaqueta, conjuntoApi] = productosIniciales();

    expect(productoDesdeApi(chaqueta)).toEqual({
      id: 1, nombre: "Chaqueta Oficial F1", categoria: "Chaquetas", categoriaId: 1,
      precio: 120000, precioOferta: 0, oferta: false, archivo: "Chaqueta_1.jpeg", stock: 10,
    });
    // Con oferta conserva el precio rebajado.
    expect(productoDesdeApi(conjuntoApi)).toEqual(jasmine.objectContaining({ oferta: true, precioOferta: 69000 }));
    expect(productosDesdeApi(productosIniciales()).length).toBe(12);
  });

  describe("productoParaApi (formulario → cuerpo de la API)", () => {
    const form = {
      nombre: "  Gorra F1 ", categoriaId: "3", precio: "30000", stock: "4",
      oferta: false, precioOferta: "", archivo: " Gorra1.jpeg ",
    };

    it("convierte los números, recorta los textos y envía precioOferta null sin oferta", () => {
      expect(productoParaApi(form)).toEqual({
        nombre: "Gorra F1", categoriaId: 3, precio: 30000, precioOferta: null, imagen: "Gorra1.jpeg", stock: 4,
      });
    });

    it("con oferta marcada envía el precio de oferta; sin precio escrito, null", () => {
      expect(productoParaApi({ ...form, oferta: true, precioOferta: "25000" }).precioOferta).toBe(25000);
      expect(productoParaApi({ ...form, oferta: true, precioOferta: "" }).precioOferta).toBe(null);
      // Con la casilla desmarcada se ignora un precio de oferta que haya quedado escrito.
      expect(productoParaApi({ ...form, oferta: false, precioOferta: "25000" }).precioOferta).toBe(null);
    });

    it("un stock vacío se envía como 0", () => {
      expect(productoParaApi({ ...form, stock: "" }).stock).toBe(0);
    });
  });

  it("crear, actualizar y eliminar llaman a la ruta correcta y devuelven la forma de las vistas", async () => {
    const llamadas = [];
    const [chaqueta] = productosIniciales();
    simularBackend({
      "POST /productos": ({ cuerpo }) => { llamadas.push(["POST", cuerpo]); return respuestaJson(201, chaqueta); },
      "PUT /productos/1": ({ cuerpo }) => { llamadas.push(["PUT", cuerpo]); return respuestaJson(200, chaqueta); },
      "DELETE /productos/1": () => { llamadas.push(["DELETE"]); return new Response(null, { status: 204 }); },
    });
    const form = { nombre: "X", categoriaId: "1", precio: "10", stock: "1", oferta: false, precioOferta: "", archivo: "x.jpeg" };

    expect((await crearProducto(form)).archivo).toBe("Chaqueta_1.jpeg");
    expect((await actualizarProducto(1, form)).nombre).toBe("Chaqueta Oficial F1");
    expect(await eliminarProducto(1)).toBe(null);
    expect(llamadas.map(([metodo]) => metodo)).toEqual(["POST", "PUT", "DELETE"]);
  });
});

describe("Ventas: compraParaApi y crearBoleta", () => {
  const datos = { entrega: "despacho", direccion: " Calle 1 ", ciudad: " Santiago ", cuponCodigo: "" };

  it("agrupa los ítems repetidos del carrito en una línea con su cantidad", () => {
    const cuerpo = compraParaApi({ ...datos, carrito: [gorra, conjunto, gorra, gorra] });

    expect(cuerpo.items).toEqual([{ productoId: 3, cantidad: 3 }, { productoId: 2, cantidad: 1 }]);
  });

  it("no envía precios, convierte la entrega y recorta la dirección", () => {
    const cuerpo = compraParaApi({ ...datos, carrito: [gorra] });

    expect(cuerpo).toEqual({
      items: [{ productoId: 3, cantidad: 1 }],
      tipoEntrega: "DESPACHO",
      direccionEnvio: "Calle 1",
      ciudad: "Santiago",
      cuponCodigo: null,
    });
  });

  it("retiro en tienda y cupón: los envía tal cual", () => {
    const cuerpo = compraParaApi({ ...datos, carrito: [gorra], entrega: "retiro", cuponCodigo: "F1AUDI" });

    expect(cuerpo.tipoEntrega).toBe("RETIRO");
    expect(cuerpo.cuponCodigo).toBe("F1AUDI");
  });

  it("crearBoleta envía la compra con la sesión y devuelve la boleta emitida", async () => {
    guardarSesionDePrueba(USUARIOS.cliente);
    simularBackend({
      "POST /boletas": ({ cuerpo, token }) => respuestaJson(201, { id: 7, total: 35000, token: !!token, items: cuerpo.items }),
    });

    const boleta = await crearBoleta({ ...datos, carrito: [gorra] });

    expect(boleta).toEqual({ id: 7, total: 35000, token: true, items: [{ productoId: 3, cantidad: 1 }] });
  });
});

describe("Utilidades", () => {
  it("formatearPrecio usa pesos chilenos con separador de miles", () => {
    expect(formatearPrecio(120000)).toBe("$120.000");
    expect(formatearPrecio("45000")).toBe("$45.000");
    expect(formatearPrecio(0)).toBe("$0");
  });

  it("describirError agrega los detalles de validación cuando los hay", () => {
    expect(describirError(new ErrorApi(409, "Sin stock"))).toBe("Sin stock");
    expect(describirError(new ErrorApi(400, "Datos inválidos", ["precio: negativo", "stock: negativo"])))
      .toBe("Datos inválidos: precio: negativo; stock: negativo");
    // Un error cualquiera (sin campo detalles) se muestra con su mensaje.
    expect(describirError(new Error("falló"))).toBe("falló");
  });
});
