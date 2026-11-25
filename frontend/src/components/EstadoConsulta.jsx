/* Muestra el estado de una consulta a la API mientras no hay datos que mostrar:
   un aviso de carga o el mensaje de error. Si hay datos, no dibuja nada. */
export default function EstadoConsulta({ cargando, error, textoCarga = "Cargando..." }) {
  if (cargando) {
    return <p className="text-muted text-center">{textoCarga}</p>;
  }
  if (error) {
    return (
      <div className="alert alert-danger rounded-0 border-0 text-center" role="alert">
        {error.message}
      </div>
    );
  }
  return null;
}
