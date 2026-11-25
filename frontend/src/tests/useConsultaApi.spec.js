/* Hook useConsultaApi: carga, error, cambio de ruta, transformación y recarga. */
import { act, cleanup, renderHook } from "@testing-library/react";
import { useConsultaApi } from "../hooks/useConsultaApi";
import { errorApi, esperar, respuestaJson, simularBackend } from "./helpers";

const duplicar = (lista) => lista.map((n) => n * 2);

describe("useConsultaApi", () => {
  // Sin sesión guardada por otras pruebas: las consultas salen sin Authorization.
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("empieza cargando y luego entrega los datos sin transformar", async () => {
    simularBackend({ "GET /numeros": () => respuestaJson(200, [1, 2]) });

    const { result } = renderHook(() => useConsultaApi("/numeros"));
    expect(result.current).toEqual(jasmine.objectContaining({ cargando: true, datos: null, error: null }));

    await esperar(() => result.current.cargando === false);
    expect(result.current.datos).toEqual([1, 2]);
  });

  it("aplica la transformación indicada a la respuesta", async () => {
    simularBackend({ "GET /numeros": () => respuestaJson(200, [1, 2]) });

    const { result } = renderHook(() => useConsultaApi("/numeros", duplicar));

    await esperar(() => result.current.datos?.join() === "2,4");
  });

  it("si la consulta falla entrega el error y no los datos", async () => {
    simularBackend({ "GET /numeros": () => errorApi(500, "Ocurrió un error inesperado") });

    const { result } = renderHook(() => useConsultaApi("/numeros"));

    await esperar(() => result.current.error !== null);
    expect(result.current.error.message).toBe("Ocurrió un error inesperado");
    expect(result.current.datos).toBe(null);
    expect(result.current.cargando).toBe(false);
  });

  it("al cambiar de ruta vuelve a cargar y no mezcla los datos de la ruta anterior", async () => {
    simularBackend({
      "GET /a": () => respuestaJson(200, "datos de a"),
      "GET /b": () => respuestaJson(200, "datos de b"),
    });

    const { result, rerender } = renderHook(({ ruta }) => useConsultaApi(ruta), { initialProps: { ruta: "/a" } });
    await esperar(() => result.current.datos === "datos de a");

    rerender({ ruta: "/b" });
    expect(result.current).toEqual(jasmine.objectContaining({ cargando: true, datos: null }));
    await esperar(() => result.current.datos === "datos de b");
  });

  it("recargar consulta de nuevo sin vaciar los datos mientras espera", async () => {
    let version = 1;
    simularBackend({ "GET /contador": () => respuestaJson(200, version) });
    const { result } = renderHook(() => useConsultaApi("/contador"));
    await esperar(() => result.current.datos === 1);

    version = 2;
    act(() => result.current.recargar());

    // Mientras llega la respuesta nueva se siguen mostrando los datos anteriores.
    expect(result.current.cargando).toBe(false);
    expect(result.current.datos).toBe(1);
    await esperar(() => result.current.datos === 2);
  });
});
