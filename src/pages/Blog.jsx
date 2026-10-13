/* Vista Blog / Noticias F1: tarjetas de noticias migradas de la EP1.
   Las noticias viven en un arreglo de datos local (fácil de extender). */
import { useState } from "react";

const NOTICIAS = [
  {
    id: 1,
    categoria: "Ingeniería",
    titulo: "La nueva unidad de potencia toma forma",
    bajada:
      "Descubre cómo los ingenieros en Neuburg están desarrollando el revolucionario motor que combinará energía eléctrica y combustibles sostenibles para dominar en 2026.",
    imagen: "/img/Chaqueta_1.jpeg",
    enlace: "https://www.audi.com/en/formula1.html",
  },
  {
    id: 2,
    categoria: "Fichajes",
    titulo: "Los candidatos al volante",
    bajada:
      "Analizamos quiénes son los pilotos experimentados que la escudería alemana tiene en la mira para liderar su ambicioso proyecto desde la primera carrera.",
    imagen: "/img/Gorra2.jpeg",
    enlace: "https://www.audi.com/en/formula1.html",
  },
];

export default function Blog() {
  // Las noticias se gestionan como datos (estado), no hardcodeadas en el JSX
  const [noticias] = useState(NOTICIAS);

  return (
    <section className="container py-5">
      <h2 className="fw-bold mb-2 text-center text-uppercase">
        Casos Curiosos y Noticias
      </h2>
      <p className="text-center text-muted mb-5">
        Toda la información del proyecto Audi Formula 1 para 2026.
      </p>

      <div className="row g-5">
        {noticias.map((noticia) => (
          <div className="col-md-6" key={noticia.id}>
            <article className="card h-100 border-0 shadow-sm rounded-0">
              <img
                src={noticia.imagen}
                className="card-img-top rounded-0"
                alt={noticia.titulo}
                style={{ height: "280px", objectFit: "cover" }}
              />
              <div className="card-body d-flex flex-column p-4">
                <span className="badge bg-danger mb-2 align-self-start">
                  {noticia.categoria}
                </span>
                <h4 className="card-title fw-bold text-uppercase mb-3">
                  {noticia.titulo}
                </h4>
                <p className="card-text text-muted mb-4">{noticia.bajada}</p>
                <a
                  href={noticia.enlace}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-dark mt-auto rounded-0 fw-bold text-uppercase border-2"
                >
                  Leer Caso Completo
                </a>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
