/* =========================================================
   PRUEBAS DEL HOOK useCarrito / CarritoContext (estado global)
   Abarca: estado inicial, agregar/eliminar, cupones, totales,
   persistencia en localStorage y el toast que se oculta solo.
   Técnicas: renderHook (probar un hook sin UI), spies sobre
   localStorage y jasmine.clock() para simular el paso del tiempo.
========================================================= */
import { renderHook, act, cleanup } from "@testing-library/react";
import { CarritoProvider, useCarrito } from "../context/CarritoContext";
import { gorra, conjunto, guardarCarrito } from "./helpers";

// Wrapper: el hook necesita estar dentro del Provider
function wrapper({ children }) {
  return <CarritoProvider>{children}</CarritoProvider>;
}

function montarHook() {
  return renderHook(() => useCarrito(), { wrapper });
}

describe("Hook useCarrito (CarritoContext)", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("inicia vacío cuando no hay carrito guardado", () => {
    const { result } = montarHook();
    expect(result.current.cantidad).toBe(0);
    expect(result.current.total).toBe(0);
    expect(result.current.descuento).toBe(0);
  });

  it("MOCK: lee el carrito guardado usando localStorage.getItem", () => {
    // Spy que reemplaza getItem y devuelve un carrito simulado
    const spyGet = spyOn(Storage.prototype, "getItem").and.returnValue(
      JSON.stringify([gorra, conjunto])
    );
    const { result } = montarHook();

    expect(spyGet).toHaveBeenCalledWith("carritoTienda");
    expect(result.current.cantidad).toBe(2);
    expect(result.current.subtotal).toBe(35000 + 69000);
  });

  it("agregarAlCarrito suma el producto y lo persiste con setItem", () => {
    // callThrough: espía la llamada pero deja que se guarde de verdad
    const spySet = spyOn(Storage.prototype, "setItem").and.callThrough();
    const { result } = montarHook();

    act(() => result.current.agregarAlCarrito(gorra));

    expect(result.current.cantidad).toBe(1);
    expect(result.current.subtotal).toBe(35000);
    expect(spySet).toHaveBeenCalledWith("carritoTienda", JSON.stringify([gorra]));
  });

  it("eliminarDelCarrito quita solo el ítem de la posición indicada", () => {
    guardarCarrito([gorra, conjunto, gorra]);
    const { result } = montarHook();

    act(() => result.current.eliminarDelCarrito(1));

    expect(result.current.cantidad).toBe(2);
    expect(result.current.carrito.map((p) => p.id)).toEqual([3, 3]);
  });

  it("aplica el cupón F1AUDI (10%) aunque venga en minúsculas y con espacios", () => {
    guardarCarrito([gorra]);
    const { result } = montarHook();

    let valido;
    act(() => {
      valido = result.current.aplicarCupon("  f1audi ");
    });

    expect(valido).toBe(true);
    expect(result.current.descuento).toBe(10);
    expect(result.current.total).toBe(31500);
  });

  it("rechaza un cupón inválido y deja el descuento en 0", () => {
    guardarCarrito([gorra]);
    const { result } = montarHook();

    act(() => result.current.aplicarCupon("NEUBURG2026")); // primero uno válido (15%)
    expect(result.current.descuento).toBe(15);

    let valido;
    act(() => {
      valido = result.current.aplicarCupon("GRATIS");
    });
    expect(valido).toBe(false);
    expect(result.current.descuento).toBe(0);
    expect(result.current.total).toBe(35000);
  });

  it("vaciarCarrito deja todo en cero y borra la clave de localStorage", () => {
    guardarCarrito([gorra, conjunto]);
    const spyRemove = spyOn(Storage.prototype, "removeItem").and.callThrough();
    const { result } = montarHook();

    act(() => result.current.aplicarCupon("F1AUDI"));
    act(() => result.current.vaciarCarrito());

    expect(result.current.cantidad).toBe(0);
    expect(result.current.descuento).toBe(0);
    expect(spyRemove).toHaveBeenCalledWith("carritoTienda");
  });

  describe("toast de confirmación", () => {
    // jasmine.clock() simula el reloj: no esperamos 2,5 s reales
    beforeEach(() => jasmine.clock().install());
    afterEach(() => jasmine.clock().uninstall());

    it("muestra el mensaje al agregar y lo oculta solo a los 2,5 segundos", () => {
      const { result } = montarHook();

      act(() => result.current.agregarAlCarrito(gorra));
      expect(result.current.toast).toContain("Gorra Negra Audi F1");

      act(() => jasmine.clock().tick(2499));
      expect(result.current.toast).not.toBe(null); // aún visible

      act(() => jasmine.clock().tick(1));
      expect(result.current.toast).toBe(null); // se ocultó
    });

    it("cerrarToast lo oculta de inmediato", () => {
      const { result } = montarHook();
      act(() => result.current.agregarAlCarrito(gorra));
      act(() => result.current.cerrarToast());
      expect(result.current.toast).toBe(null);
    });
  });
});
