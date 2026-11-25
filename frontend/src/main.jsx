import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// Solo el CSS de Bootstrap. Los menús colapsables se manejan con estado
// de React (ver Navbar y AdminLayout), así que no se carga bootstrap.bundle.js.
import "bootstrap/dist/css/bootstrap.min.css";

// Íconos y estilos propios: van después de Bootstrap para poder sobrescribirlo.
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/styles.css";
import "./styles/carrito.css";
import "./styles/admin.css";
import "./styles/toast.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
