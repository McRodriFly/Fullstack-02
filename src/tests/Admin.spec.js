/* =========================================================
   PRUEBAS DEL PANEL DE ADMINISTRACIÓN
   Abarca: KPIs del dashboard, alerta de stock crítico, CRUD de
   productos y usuarios desde la interfaz, menú responsivo.
   Mocks: window.confirm se reemplaza con un spy para simular
   que el usuario acepta o cancela sin abrir el diálogo real.
========================================================= */
import { screen, fireEvent, cleanup } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../pages/admin/AdminLayout";
import AdminHome from "../pages/admin/AdminHome";
import AdminProductos from "../pages/admin/AdminProductos";
import AdminUsuarios from "../pages/admin/AdminUsuarios";
import { actualizarProducto, obtenerProductos } from "../data/productos";
import { obtenerUsuarios } from "../data/usuarios";
import { renderConTienda } from "./helpers";

function renderAdmin(ruta = "/admin") {
  return renderConTienda(
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="productos" element={<AdminProductos />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
      </Route>
    </Routes>,
    ruta
  );
}

// Escribe en un campo del formulario buscándolo por su atributo name
function escribir(container, name, value) {
  fireEvent.change(container.querySelector(`[name="${name}"]`), { target: { value } });
}

describe("Admin: dashboard y layout", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("calcula los KPIs a partir del catálogo", () => {
    renderAdmin("/admin");
    expect(screen.getByText("Productos activos").parentElement.textContent).toContain("12");
    expect(screen.getByText("Productos en oferta").parentElement.textContent).toContain("4");
    // Sin productos bajo 5 unidades no hay alerta
    expect(screen.queryByRole("alert")).toBe(null);
  });

  it("muestra la alerta de stock crítico cuando un producto tiene menos de 5 unidades", () => {
    obtenerProductos(); // siembra el catálogo
    actualizarProducto(1, { stock: 2 });
    renderAdmin("/admin");
    expect(screen.getByRole("alert").textContent).toContain("quedan 2 unidades");
  });

  it("menú responsivo: el botón MENÚ muestra y oculta los enlaces", () => {
    const { container } = renderAdmin("/admin");
    const menu = container.querySelector("#menuAdmin");
    expect(menu.classList.contains("d-none")).toBe(true);

    fireEvent.click(screen.getByText("MENÚ"));
    expect(menu.classList.contains("d-flex")).toBe(true);

    // Elegir una opción cierra el menú y navega
    fireEvent.click(screen.getByText("Mantenedor Usuarios"));
    expect(menu.classList.contains("d-none")).toBe(true);
    expect(screen.getByText("Usuarios")).toBeTruthy();
  });
});

describe("Admin: mantenedor de productos", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("valida cada campo del formulario antes de guardar", () => {
    const { container } = renderAdmin("/admin/productos");
    const guardar = () => fireEvent.click(screen.getByText("GUARDAR DATOS"));

    guardar();
    expect(screen.getByText("El nombre es obligatorio.")).toBeTruthy();

    escribir(container, "nombre", "Gorra nueva");
    guardar();
    expect(screen.getByText("Selecciona una categoría.")).toBeTruthy();

    escribir(container, "categoria", "Gorras");
    escribir(container, "precio", "0");
    guardar();
    expect(screen.getByText("El precio debe ser mayor a 0.")).toBeTruthy();

    escribir(container, "precio", "30000");
    guardar();
    expect(screen.getByText("Indica el nombre del archivo de imagen.")).toBeTruthy();

    // Sin stock ni oferta: se guarda con stock 0 y precioOferta 0
    escribir(container, "archivo", "Gorra1.jpeg");
    guardar();
    const creada = obtenerProductos().find((p) => p.nombre === "Gorra nueva");
    expect(creada.stock).toBe(0);
    expect(creada.precioOferta).toBe(0);
  });

  it("CREAR: agrega un producto en oferta y aparece en la tabla", () => {
    const { container } = renderAdmin("/admin/productos");
    escribir(container, "nombre", "Polerón F1");
    escribir(container, "precio", "60000");
    escribir(container, "stock", "4");
    escribir(container, "categoria", "Poleras");
    escribir(container, "archivo", "Polera_Tipo1_1.jpeg");
    fireEvent.click(container.querySelector('[name="oferta"]'));
    escribir(container, "precioOferta", "50000");
    fireEvent.click(screen.getByText("GUARDAR DATOS"));

    expect(screen.getByText("Polerón F1")).toBeTruthy();
    const creado = obtenerProductos().find((p) => p.nombre === "Polerón F1");
    expect(creado.precioOferta).toBe(50000);
    expect(creado.oferta).toBe(true);
  });

  it("ACTUALIZAR: carga el producto en el formulario y guarda el cambio", () => {
    spyOn(window, "scrollTo"); // mock: evita el scroll real
    const { container } = renderAdmin("/admin/productos");

    fireEvent.click(screen.getAllByTitle("Editar")[0]);
    expect(screen.getByText("Editando producto #1")).toBeTruthy();

    escribir(container, "precio", "99000");
    fireEvent.click(screen.getByText("ACTUALIZAR"));

    expect(obtenerProductos()[0].precio).toBe(99000);
    expect(screen.getByText("Nuevo producto")).toBeTruthy(); // vuelve a modo crear
  });

  it("ELIMINAR: solo borra si el usuario confirma (mock de window.confirm)", () => {
    const spyConfirm = spyOn(window, "confirm").and.returnValue(false);
    renderAdmin("/admin/productos");

    fireEvent.click(screen.getAllByTitle("Eliminar")[0]);
    expect(spyConfirm).toHaveBeenCalledWith("¿Eliminar este producto?");
    expect(obtenerProductos().length).toBe(12); // canceló: no se borra

    spyConfirm.and.returnValue(true);
    fireEvent.click(screen.getAllByTitle("Eliminar")[0]);
    expect(obtenerProductos().length).toBe(11);
  });

  it("CANCELAR limpia el formulario de edición", () => {
    spyOn(window, "scrollTo");
    renderAdmin("/admin/productos");
    fireEvent.click(screen.getAllByTitle("Editar")[0]);
    fireEvent.click(screen.getByText("CANCELAR"));
    expect(screen.getByText("Nuevo producto")).toBeTruthy();
  });
});

describe("Admin: mantenedor de usuarios", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("lista los usuarios iniciales", () => {
    renderAdmin("/admin/usuarios");
    expect(screen.getByText("admin@duoc.cl")).toBeTruthy();
    expect(screen.getAllByTitle("Eliminar").length).toBe(3);
  });

  it("agrega un usuario nuevo con rol admin", () => {
    const { container } = renderAdmin("/admin/usuarios");
    escribir(container, "nombre", "Nueva Admin");
    escribir(container, "correo", "nueva@duoc.cl");
    escribir(container, "rol", "admin");
    fireEvent.click(screen.getByText("AGREGAR"));

    expect(screen.getByText("nueva@duoc.cl")).toBeTruthy();
    expect(obtenerUsuarios().length).toBe(4);
  });

  it("no agrega si faltan datos", () => {
    renderAdmin("/admin/usuarios");
    fireEvent.click(screen.getByText("AGREGAR"));
    expect(obtenerUsuarios().length).toBe(3);
  });

  it("no elimina el usuario si se cancela la confirmación", () => {
    spyOn(window, "confirm").and.returnValue(false);
    renderAdmin("/admin/usuarios");
    fireEvent.click(screen.getAllByTitle("Eliminar")[0]);
    expect(obtenerUsuarios().length).toBe(3);
  });

  it("con la lista vacía el primer usuario recibe id 1", () => {
    localStorage.setItem("audi_f1_usuarios", "[]");
    const { container } = renderAdmin("/admin/usuarios");
    escribir(container, "nombre", "Solo");
    escribir(container, "correo", "solo@duoc.cl");
    fireEvent.click(screen.getByText("AGREGAR"));
    expect(obtenerUsuarios()[0].id).toBe(1);
  });

  it("elimina un usuario cuando se confirma", () => {
    spyOn(window, "confirm").and.returnValue(true);
    renderAdmin("/admin/usuarios");
    fireEvent.click(screen.getAllByTitle("Eliminar")[2]);
    expect(screen.queryByText("piloto@duoc.cl")).toBe(null);
    expect(obtenerUsuarios().length).toBe(2);
  });
});
