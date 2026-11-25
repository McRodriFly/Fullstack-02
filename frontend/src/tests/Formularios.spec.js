/* Formularios: login y registro contra el backend simulado (redirección por rol y
   errores), selects región/comuna y contacto. */
import { screen, fireEvent, cleanup } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Registro from "../pages/Registro";
import Contacto from "../pages/Contacto";
import {
  CLAVE_SESION, USUARIOS, errorApi, respuestaJson, respuestaSesion, renderConTienda, simularBackend,
} from "./helpers";

function escribir(id, value) {
  fireEvent.change(document.getElementById(id), { target: { value } });
}

describe("Login: redirección según rol", () => {
  beforeEach(() => localStorage.removeItem(CLAVE_SESION));
  afterEach(cleanup);

  function renderLogin() {
    return renderConTienda(
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<h1>Panel admin</h1>} />
        <Route path="/admin/productos" element={<h1>Panel productos</h1>} />
        <Route path="/" element={<h1>Tienda</h1>} />
      </Routes>,
      "/login"
    );
  }

  function ingresarComo(correo, password = "1234") {
    renderLogin();
    escribir("correo", correo);
    escribir("password", password);
    fireEvent.click(screen.getByText("INGRESAR"));
  }

  it("el administrador entra al panel con el rol que entrega el backend", async () => {
    simularBackend({ "POST /auth/login": () => respuestaJson(200, respuestaSesion(USUARIOS.admin)) });
    ingresarComo("admin@duoc.cl");
    expect(await screen.findByText("Panel admin")).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(CLAVE_SESION)).usuario.rol).toBe("ROLE_ADMIN");
  });

  it("el vendedor entra al panel directo a los productos", async () => {
    simularBackend({ "POST /auth/login": () => respuestaJson(200, respuestaSesion(USUARIOS.vendedor)) });
    ingresarComo("vendedor@duoc.cl");
    expect(await screen.findByText("Panel productos")).toBeTruthy();
  });

  it("el cliente vuelve a la tienda", async () => {
    simularBackend({ "POST /auth/login": () => respuestaJson(200, respuestaSesion(USUARIOS.cliente)) });
    ingresarComo("cliente@gmail.com");
    expect(await screen.findByText("Tienda")).toBeTruthy();
  });

  it("mientras espera al backend deshabilita el botón", async () => {
    let responder;
    simularBackend({ "POST /auth/login": () => new Promise((r) => { responder = r; }) });
    ingresarComo("cliente@gmail.com");

    const boton = await screen.findByText("INGRESANDO...");
    expect(boton.disabled).toBe(true);

    responder(respuestaJson(200, respuestaSesion(USUARIOS.cliente)));
    expect(await screen.findByText("Tienda")).toBeTruthy();
  });

  it("con credenciales incorrectas muestra el mensaje del backend y permite reintentar", async () => {
    simularBackend({ "POST /auth/login": () => errorApi(401, "Correo o contraseña incorrectos") });
    ingresarComo("admin@duoc.cl", "9999");

    expect(await screen.findByText("Correo o contraseña incorrectos")).toBeTruthy();
    expect(screen.getByText("INGRESAR").disabled).toBe(false);
    expect(localStorage.getItem(CLAVE_SESION)).toBe(null);
  });
});

describe("Registro", () => {
  beforeEach(() => localStorage.removeItem(CLAVE_SESION));
  afterEach(cleanup);

  function renderRegistro() {
    return renderConTienda(
      <Routes>
        <Route path="/registro" element={<Registro />} />
        <Route path="/" element={<h1>Tienda</h1>} />
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

  function completarRegistro() {
    escribir("rut", "111111111");
    escribir("correo", "nuevo@gmail.com");
    escribir("nombre", "Carlos");
    escribir("apellidos", "Sainz");
    escribir("password", "1234");
    escribir("passwordConf", "1234");
    fireEvent.click(screen.getByText("REGISTRARSE"));
  }

  it("con datos válidos crea la cuenta, deja la sesión iniciada y vuelve a la tienda", async () => {
    let enviado;
    simularBackend({
      "POST /auth/registro": ({ cuerpo }) => {
        enviado = cuerpo;
        return respuestaJson(201, respuestaSesion({ ...USUARIOS.cliente, nombre: "Carlos Sainz" }));
      },
    });
    renderRegistro();
    completarRegistro();

    expect(await screen.findByText("Tienda")).toBeTruthy();
    expect(enviado).toEqual({ nombre: "Carlos Sainz", correo: "nuevo@gmail.com", contrasena: "1234" });
    expect(JSON.parse(localStorage.getItem(CLAVE_SESION)).usuario.nombre).toBe("Carlos Sainz");
  });

  it("si el correo ya está registrado muestra el mensaje del backend", async () => {
    simularBackend({ "POST /auth/registro": () => errorApi(409, "El correo nuevo@gmail.com ya está registrado") });
    renderRegistro();
    completarRegistro();

    expect(await screen.findByText("El correo nuevo@gmail.com ya está registrado")).toBeTruthy();
    expect(screen.getByText("REGISTRARSE").disabled).toBe(false);
  });

  it("mientras se crea la cuenta deshabilita el botón", async () => {
    simularBackend({ "POST /auth/registro": () => new Promise(() => {}) });
    renderRegistro();
    completarRegistro();

    expect((await screen.findByText("CREANDO CUENTA...")).disabled).toBe(true);
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
