/* =========================================================
   PRUEBAS DEL COMPONENTE Login (estado + eventos)
   Abarca: gestión del estado del formulario y renderizado
   condicional del mensaje de error al enviar datos inválidos.
========================================================= */
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(cleanup);

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe("Componente Login", () => {
  it("el estado del formulario cambia cuando el usuario escribe", () => {
    renderLogin();
    const inputCorreo = document.getElementById("correo");
    fireEvent.change(inputCorreo, { target: { name: "correo", value: "alumno@duoc.cl" } });
    // El estado controlado actualizó el valor del input
    expect(inputCorreo.value).toBe("alumno@duoc.cl");
  });

  it("muestra el mensaje de error SOLO cuando la validación falla (renderizado condicional)", () => {
    const { container } = renderLogin();
    // Antes de enviar: no hay mensaje de error
    expect(container.querySelector(".alert-danger")).toBe(null);

    // Enviamos el formulario vacío
    fireEvent.click(screen.getByText("INGRESAR"));

    // Ahora sí aparece el error por correo obligatorio
    expect(screen.getByText(/correo es obligatorio/i)).toBeTruthy();
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
  });
});
