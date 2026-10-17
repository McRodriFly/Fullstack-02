/* =========================================================
   PRUEBAS DE FORMULARIOS: Login (redirección por rol),
   Registro (selects encadenados región/comuna) y Contacto.
========================================================= */
import { screen, fireEvent, cleanup } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Registro from "../pages/Registro";
import Contacto from "../pages/Contacto";
import { renderConTienda } from "./helpers";

// Escribe un valor en el input con ese id
function escribir(id, value) {
  fireEvent.change(document.getElementById(id), { target: { value } });
}

describe("Login: redirección según rol", () => {
  afterEach(cleanup);

  function renderLogin() {
    return renderConTienda(
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<h1>Panel admin</h1>} />
        <Route path="/" element={<h1>Tienda</h1>} />
      </Routes>,
      "/login"
    );
  }

  it("un correo con 'admin' entra al panel de administración", () => {
    renderLogin();
    escribir("correo", "admin@duoc.cl");
    escribir("password", "1234");
    fireEvent.click(screen.getByText("INGRESAR"));
    expect(screen.getByText("Panel admin")).toBeTruthy();
  });

  it("un cliente vuelve a la tienda", () => {
    renderLogin();
    escribir("correo", "fan@gmail.com");
    escribir("password", "1234");
    fireEvent.click(screen.getByText("INGRESAR"));
    expect(screen.getByText("Tienda")).toBeTruthy();
  });
});

describe("Registro", () => {
  afterEach(cleanup);

  function renderRegistro() {
    return renderConTienda(
      <Routes>
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<h1>Pantalla login</h1>} />
      </Routes>,
      "/registro"
    );
  }

  it("la comuna está deshabilitada hasta elegir región y luego lista sus comunas", () => {
    renderRegistro();
    const comuna = document.getElementById("comuna");
    expect(comuna.disabled).toBe(true);

    escribir("region", "Región de Valparaíso");

    expect(comuna.disabled).toBe(false);
    // 3 comunas + la opción "-- Seleccione comuna --"
    expect(comuna.options.length).toBe(4);
    expect(screen.getByText("Viña del Mar")).toBeTruthy();
  });

  it("al cambiar de región se reinicia la comuna elegida", () => {
    renderRegistro();
    escribir("region", "Región Metropolitana");
    escribir("comuna", "Maipú");
    expect(document.getElementById("comuna").value).toBe("Maipú");

    escribir("region", "Región del Biobío");
    expect(document.getElementById("comuna").value).toBe("");
  });

  it("muestra error con RUT inválido", () => {
    renderRegistro();
    escribir("rut", "111111112");
    fireEvent.click(screen.getByText("REGISTRARSE"));
    expect(screen.getByText(/RUT inválido/)).toBeTruthy();
  });

  it("con datos válidos redirige al login", () => {
    renderRegistro();
    escribir("rut", "111111111");
    escribir("correo", "nuevo@gmail.com");
    escribir("nombre", "Carlos");
    escribir("apellidos", "Sainz");
    escribir("password", "1234");
    escribir("passwordConf", "1234");
    fireEvent.click(screen.getByText("REGISTRARSE"));
    expect(screen.getByText("Pantalla login")).toBeTruthy();
  });
});

describe("Contacto", () => {
  afterEach(cleanup);

  it("muestra error si faltan datos", () => {
    renderConTienda(<Contacto />);
    fireEvent.click(screen.getByText("ENVIAR MENSAJE"));
    expect(screen.getByText(/nombre es obligatorio/i)).toBeTruthy();
  });

  it("con datos válidos confirma el envío y limpia el formulario", () => {
    renderConTienda(<Contacto />);
    escribir("nombre", "Ana");
    escribir("correo", "ana@duoc.cl");
    escribir("comentario", "¿Tienen tallas XL?");
    fireEvent.click(screen.getByText("ENVIAR MENSAJE"));

    expect(screen.getByText(/mensaje enviado a pits/i)).toBeTruthy();
    expect(document.getElementById("nombre").value).toBe("");
  });
});
