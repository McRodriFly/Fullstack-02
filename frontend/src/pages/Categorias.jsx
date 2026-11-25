/* /categorias — catálogo filtrado por categoría.
   Las categorías vienen de GET /api/v1/categorias y los productos de GET /productos.
   El filtro vive en la URL (?cat=Gorras) con useSearchParams y no en useState:
   el enlace se puede compartir, sobrevive a un recargo y funciona con "atrás". */
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import EstadoConsulta from "../components/EstadoConsulta";
import { useConsultaApi } from "../hooks/useConsultaApi";
import { productosDesdeApi } from "../services/catalogo";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import { puedeUsarCarrito } from "../utils/roles";

export default function Categorias() {
  const productosApi = useConsultaApi("/productos", productosDesdeApi);
  const categoriasApi = useConsultaApi("/categorias");
  // Sin ?cat se muestran todas.
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaActiva = searchParams.get("cat") || "todas";

  function cambiarCategoria(categoria) {
    setSearchParams(categoria === "todas" ? {} : { cat: categoria });
  }
  const { agregarAlCarrito } = useCarrito();
  const { usuario } = useAuth();

  function handleAgregar(producto, precioFinal) {
    agregarAlCarrito({ ...producto, precio: precioFinal });
  }

  const productos = productosApi.datos;
  const categorias = categoriasApi.datos;
  const productosFiltrados =
    categoriaActiva === "todas"
      ? productos
      : productos?.filter((p) => p.categoria === categoriaActiva);

  return (
    <section className="container py-5">
      <h2 className="fw-bold text-uppercase text-center mb-2">Categorías</h2>
      <p className="text-muted text-center mb-4">
        Explora la colección oficial según el tipo de producto.
      </p>

      <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
        <button
          className={`btn rounded-0 fw-bold ${categoriaActiva === "todas" ? "btn-danger" : "btn-outline-dark"}`}
          onClick={() => cambiarCategoria("todas")}
        >
          TODAS
        </button>
        {categorias?.map((categoria) => (
          <button
            key={categoria.id}
            className={`btn rounded-0 fw-bold ${categoriaActiva === categoria.nombre ? "btn-danger" : "btn-outline-dark"}`}
            onClick={() => cambiarCategoria(categoria.nombre)}
          >
            {categoria.nombre.toUpperCase()}
          </button>
        ))}
      </div>

      <EstadoConsulta
        cargando={productosApi.cargando}
        error={productosApi.error ?? categoriasApi.error}
        textoCarga="Cargando productos..."
      />
      {productosFiltrados && (
        <div className="row g-4">
          {productosFiltrados.map((producto) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              onAgregar={puedeUsarCarrito(usuario) ? handleAgregar : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
