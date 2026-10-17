import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// Bootstrap CSS (grilla responsiva y componentes visuales).
// No se usa el JS de Bootstrap: los menús se abren con estado de React.
import "bootstrap/dist/css/bootstrap.min.css";

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
