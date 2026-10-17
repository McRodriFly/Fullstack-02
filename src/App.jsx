/* =========================================================
   APP PRINCIPAL
   - Envuelve toda la app con el CarritoProvider (estado global)
   - Define las rutas de navegación (flujo de páginas de la EP2)
   - ErrorBoundary evita que un error deje la página en blanco
========================================================= */
import { Routes, Route, useLocation } from "react-router-dom";
import { CarritoProvider } from "./context/CarritoContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import DetalleProducto from "./pages/DetalleProducto";
import Carrito from "./pages/Carrito";
import Ofertas from "./pages/Ofertas";
import Checkout from "./pages/Checkout";
import CompraExitosa from "./pages/CompraExitosa";
import CompraFallida from "./pages/CompraFallida";
import ToastCarrito from "./components/ToastCarrito";
import ErrorBoundary from "./components/ErrorBoundary";
import NoEncontrado from "./pages/NoEncontrado";
import Categorias from "./pages/Categorias";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Contacto from "./pages/Contacto";
import Nosotros from "./pages/Nosotros";
import Blog from "./pages/Blog";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminProductos from "./pages/admin/AdminProductos";
import AdminUsuarios from "./pages/admin/AdminUsuarios";

export default function App() {
  // El panel admin tiene su propio layout (sidebar), sin navbar/footer de tienda
  const { pathname } = useLocation();
  const esAdmin = pathname.startsWith("/admin");

  return (
    <CarritoProvider>
      {/* d-flex + min-vh-100 para que el footer quede siempre abajo */}
      <div className="d-flex flex-column min-vh-100">
        {!esAdmin && <Navbar />}
        <main className="flex-grow-1">
          {/* key={pathname}: al cambiar de página el ErrorBoundary se reinicia */}
          <ErrorBoundary key={pathname}>
            <Routes>
              {/* Ruta principal: catálogo */}
              <Route path="/" element={<Home />} />
              <Route path="/producto/:id" element={<DetalleProducto />} />
              <Route path="/categorias" element={<Categorias />} />
              <Route path="/ofertas" element={<Ofertas />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              {/* Panel de administración: rutas anidadas con sidebar propio */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminHome />} />
                <Route path="productos" element={<AdminProductos />} />
                <Route path="usuarios" element={<AdminUsuarios />} />
              </Route>
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/compra-exitosa" element={<CompraExitosa />} />
              <Route path="/compra-fallida" element={<CompraFallida />} />
              {/* Ruta 404 */}
              <Route path="*" element={<NoEncontrado />} />
            </Routes>
          </ErrorBoundary>
        </main>
        {!esAdmin && <Footer />}
        {/* Toast flotante al agregar productos (visible desde cualquier página) */}
        <ToastCarrito />
      </div>
    </CarritoProvider>
  );
}
