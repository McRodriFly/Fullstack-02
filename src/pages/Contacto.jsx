/* /contacto — formulario validado con validarContacto. */
import { useState } from "react";
import { validarContacto } from "../utils/validadores";

const FORM_INICIAL = { nombre: "", correo: "", comentario: "" };

export default function Contacto() {
  const [datos, setDatos] = useState(FORM_INICIAL);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  function handleChange(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const mensaje = validarContacto(datos);
    setError(mensaje);
    if (mensaje) return;

    setDatos(FORM_INICIAL);
    setEnviado(true);
  }

  return (
    <section className="container py-5">
      <h2 className="fw-bold text-uppercase text-center mb-5">Contáctanos</h2>
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="nombre" className="form-label text-uppercase fw-bold">
                Nombre
              </label>
              <input
                type="text" id="nombre" name="nombre"
                className="form-control rounded-0 py-2" placeholder="Tu nombre"
                value={datos.nombre} onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="correo" className="form-label text-uppercase fw-bold">
                Correo Electrónico
              </label>
              <input
                type="email" id="correo" name="correo" list="dominios-correo"
                className="form-control rounded-0 py-2" placeholder="ejemplo@duoc.cl"
                value={datos.correo} onChange={handleChange}
              />
              <datalist id="dominios-correo">
                <option value="@duoc.cl"></option>
                <option value="@profesor.duoc.cl"></option>
                <option value="@gmail.com"></option>
              </datalist>
            </div>

            <div className="mb-4">
              <label htmlFor="comentario" className="form-label text-uppercase fw-bold">
                Mensaje
              </label>
              <textarea
                id="comentario" name="comentario" maxLength={500} rows={5}
                className="form-control rounded-0" placeholder="Escribe aquí tus dudas..."
                value={datos.comentario} onChange={handleChange}
              ></textarea>
              <div className="form-text">Máximo 500 caracteres.</div>
            </div>

            {error && <div className="alert alert-danger rounded-0">{error}</div>}
            {enviado && !error && (
              <div className="alert alert-success rounded-0">
                ¡Mensaje enviado a pits! El equipo de soporte te responderá a la brevedad.
              </div>
            )}

            <button type="submit" className="btn btn-dark w-100 fw-bold py-2 rounded-0">
              ENVIAR MENSAJE
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
