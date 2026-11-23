import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// Bootstrap CSS + JS (para el navbar colapsable en móvil)
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Estilos propios migrados de la EP1 (sobreescriben a Bootstrap por cascada)
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
