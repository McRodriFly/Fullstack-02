/* Login: estado controlado del formulario y validación antes de llamar al backend. */
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login";
import { AuthProvider } from "../context/AuthContext";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(cleanup);

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("Componente Login", () => {
  // Solo dentro de este describe: un hook en la raíz del archivo aplicaría a todos los specs.
  let fetch;
  beforeEach(() => {
    fetch = spyOn(window, "fetch");
  });

  it("el estado del formulario cambia cuando el usuario escribe", () => {
    renderLogin();
    const inputCorreo = document.getElementById("correo");
    fireEvent.change(inputCorreo, { target: { name: "correo", value: "alumno@duoc.cl" } });
    expect(inputCorreo.value).toBe("alumno@duoc.cl");
  });

  it("muestra el mensaje de error SOLO cuando la validación falla (renderizado condicional)", () => {
    const { container } = renderLogin();
    expect(container.querySelector(".alert-danger")).toBe(null);

    fireEvent.click(screen.getByText("INGRESAR"));

    expect(screen.getByText(/correo es obligatorio/i)).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rechaza un correo con dominio no permitido", () => {
    renderLogin();
    fireEvent.change(document.getElementById("correo"), {
      target: { name: "correo", value: "usuario@hotmail.com" },
    });
    fireEvent.change(document.getElementById("password"), {
      target: { name: "password", value: "1234" },
    });
    fireEvent.click(screen.getByText("INGRESAR"));
    expect(screen.getByText(/@duoc.cl/i)).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });
});
