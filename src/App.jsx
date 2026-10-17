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
  // /admin usa su propio layout con sidebar, sin el navbar ni el footer de la tienda.
  const { pathname } = useLocation();
  const esAdmin = pathname.startsWith("/admin");

  return (
    <CarritoProvider>
      {/* min-vh-100 + flex-grow-1 en <main>: el footer queda abajo aunque haya poco contenido */}
      <div className="d-flex flex-column min-vh-100">
        {!esAdmin && <Navbar />}
        <main className="flex-grow-1">
          {/* key={pathname} remonta el boundary al navegar, así un error no queda pegado en otras rutas */}
          <ErrorBoundary key={pathname}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/producto/:id" element={<DetalleProducto />} />
              <Route path="/categorias" element={<Categorias />} />
              <Route path="/ofertas" element={<Ofertas />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              {/* Rutas anidadas: AdminLayout renderiza cada subruta en su <Outlet /> */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminHome />} />
                <Route path="productos" element={<AdminProductos />} />
                <Route path="usuarios" element={<AdminUsuarios />} />
              </Route>
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/compra-exitosa" element={<CompraExitosa />} />
              <Route path="/compra-fallida" element={<CompraFallida />} />
              <Route path="*" element={<NoEncontrado />} />
            </Routes>
          </ErrorBoundary>
        </main>
        {!esAdmin && <Footer />}
        {/* Fuera de <Routes> para que el toast se vea en cualquier página */}
        <ToastCarrito />
      </div>
    </CarritoProvider>
  );
}
