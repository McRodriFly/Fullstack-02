/* Lee un recurso de la API (GET) y expone { datos, error, cargando, recargar }.
   - "transformar" adapta la respuesta (debe ser una función estable, definida fuera
     del componente, porque es una dependencia del efecto).
   - Si la ruta cambia (por ejemplo, otra orden), vuelve a consultar. El resultado
     recuerda de qué ruta es: mientras no llegue el de la ruta actual, se está cargando.
   - recargar() consulta de nuevo la misma ruta sin vaciar los datos mientras tanto
     (útil tras crear, editar o eliminar).
   - Una respuesta que llega tras desmontar o cambiar de ruta se descarta. */
import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

const SIN_TRANSFORMAR = (datos) => datos;

export function useConsultaApi(ruta, transformar = SIN_TRANSFORMAR) {
  const [resultado, setResultado] = useState({ ruta: null, datos: null, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    api
      .get(ruta)
      .then((datos) => vigente && setResultado({ ruta, datos: transformar(datos), error: null }))
      .catch((error) => vigente && setResultado({ ruta, datos: null, error }));
    return () => {
      vigente = false;
    };
  }, [ruta, transformar, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  const actual = resultado.ruta === ruta;
  return {
    datos: actual ? resultado.datos : null,
    error: actual ? resultado.error : null,
    cargando: !actual,
    recargar,
  };
}
