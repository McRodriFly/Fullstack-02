/* Panel de administración contra un backend simulado: KPIs, stock crítico, menú
   móvil y CRUD de productos y usuarios (incluidos los errores del backend). */
import { screen, fireEvent, cleanup, within } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../pages/admin/AdminLayout";
import AdminHome from "../pages/admin/AdminHome";
import AdminProductos from "../pages/admin/AdminProductos";
import AdminUsuarios from "../pages/admin/AdminUsuarios";
import {
  esperar, renderConTienda, guardarSesionDePrueba, USUARIOS, errorApi, simularBackend, simularCatalogo,
  simularUsuarios,
} from "./helpers";

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

// Los inputs del admin no tienen label asociado, así que se buscan por name.
function escribir(container, name, value) {
  fireEvent.change(container.querySelector(`[name="${name}"]`), { target: { value } });
}

// Cada prueba parte con el catálogo y los usuarios iniciales y una sesión de administrador.
function prepararAdmin() {
  localStorage.clear();
  guardarSesionDePrueba(USUARIOS.admin);
  const catalogo = simularCatalogo();
  const usuarios = simularUsuarios();
  return { catalogo, usuarios };
}

describe("Admin: dashboard y layout", () => {
  let catalogo;
  beforeEach(() => ({ catalogo } = prepararAdmin()));
  afterEach(cleanup);

  it("calcula los KPIs a partir del catálogo del backend", async () => {
    renderAdmin("/admin");
    expect(screen.getByText("Calculando indicadores...")).toBeTruthy();

    expect((await screen.findByText("Productos activos")).parentElement.textContent).toContain("12");
    expect(screen.getByText("Productos en oferta").parentElement.textContent).toContain("4");
    expect(screen.queryByRole("alert")).toBe(null);
  });

  it("muestra la alerta de stock crítico cuando un producto tiene menos de 5 unidades", async () => {
    catalogo.productos[0].stock = 2;
    renderAdmin("/admin");
    expect((await screen.findByRole("alert")).textContent).toContain("quedan 2 unidades");
  });

  it("muestra el error si el backend no entrega el catálogo", async () => {
    simularBackend({ "GET /productos": () => errorApi(500, "Ocurrió un error inesperado") });
    renderAdmin("/admin");
    expect(await screen.findByText("Ocurrió un error inesperado")).toBeTruthy();
    expect(screen.queryByText("Productos activos")).toBe(null);
  });

  it("menú responsivo: el botón MENÚ muestra y oculta los enlaces", async () => {
    const { container } = renderAdmin("/admin");
    const menu = container.querySelector("#menuAdmin");
    expect(menu.classList.contains("d-none")).toBe(true);

    fireEvent.click(screen.getByText("MENÚ"));
    expect(menu.classList.contains("d-flex")).toBe(true);

    fireEvent.click(screen.getByText("Mantenedor Usuarios"));
    expect(menu.classList.contains("d-none")).toBe(true);
    expect(await screen.findByText("Usuarios")).toBeTruthy();
  });
});

describe("Admin: mantenedor de productos", () => {
  let catalogo;
  beforeEach(() => ({ catalogo } = prepararAdmin()));
  afterEach(cleanup);

  async function renderProductos() {
    const vista = renderAdmin("/admin/productos");
    await screen.findByText("Chaqueta Oficial F1");
    return vista;
  }

  it("lista los productos del backend y las categorías en el formulario", async () => {
    const { container } = await renderProductos();

    expect(screen.getAllByTitle("Editar").length).toBe(12);
    const opciones = [...container.querySelector('[name="categoriaId"]').options].map((o) => o.textContent);
    expect(opciones).toEqual(["-- Seleccione --", "Chaquetas", "Ropa", "Gorras", "Accesorios", "Poleras"]);
  });

  it("valida cada campo del formulario antes de enviar nada al backend", async () => {
    const { container } = await renderProductos();
    const guardar = () => fireEvent.click(screen.getByText("GUARDAR DATOS"));

    guardar();
    expect(screen.getByText("El nombre es obligatorio.")).toBeTruthy();

    escribir(container, "nombre", "Gorra nueva");
    guardar();
    expect(screen.getByText("Selecciona una categoría.")).toBeTruthy();

    escribir(container, "categoriaId", "3");
    escribir(container, "precio", "0");
    guardar();
    expect(screen.getByText("El precio debe ser mayor a 0.")).toBeTruthy();

    escribir(container, "precio", "30000");
    guardar();
    expect(screen.getByText("Indica el nombre del archivo de imagen.")).toBeTruthy();
    expect(catalogo.productos.length).toBe(12);

    // Sin stock ni oferta: se guarda con stock 0 y sin precio de oferta (null).
    escribir(container, "archivo", "Gorra1.jpeg");
    guardar();
    expect(await screen.findByText("Gorra nueva")).toBeTruthy();
    const creada = catalogo.productos.find((p) => p.nombre === "Gorra nueva");
    expect(creada.stock).toBe(0);
    expect(creada.precioOferta).toBe(null);
  });

  it("CREAR: envía el producto en oferta al backend y aparece en la tabla", async () => {
    const { container } = await renderProductos();
    escribir(container, "nombre", "Polerón F1");
    escribir(container, "precio", "60000");
    escribir(container, "stock", "4");
    escribir(container, "categoriaId", "5");
    escribir(container, "archivo", "Polera_Tipo1_1.jpeg");
    fireEvent.click(container.querySelector('[name="oferta"]'));
    escribir(container, "precioOferta", "50000");
    fireEvent.click(screen.getByText("GUARDAR DATOS"));

    expect(await screen.findByText("Polerón F1")).toBeTruthy();
    const creado = catalogo.productos.find((p) => p.nombre === "Polerón F1");
    expect(creado).toEqual(jasmine.objectContaining({
      categoriaId: 5, precio: 60000, precioOferta: 50000, imagen: "Polera_Tipo1_1.jpeg", stock: 4,
    }));
  });

  it("un rechazo del backend al crear se muestra con sus campos y conserva el formulario", async () => {
    simularBackend({
      "POST /productos": () => errorApi(400, "Hay datos inválidos en la solicitud", ["precioOferta: debe ser menor al precio"]),
    });
    const { container } = await renderProductos();
    escribir(container, "nombre", "Polerón F1");
    escribir(container, "precio", "60000");
    escribir(container, "categoriaId", "5");
    escribir(container, "archivo", "Polera_Tipo1_1.jpeg");

    fireEvent.click(screen.getByText("GUARDAR DATOS"));

    expect(await screen.findByText("Hay datos inválidos en la solicitud: precioOferta: debe ser menor al precio")).toBeTruthy();
    expect(container.querySelector('[name="nombre"]').value).toBe("Polerón F1");
    expect(screen.getByText("GUARDAR DATOS").disabled).toBe(false);
  });

  it("ACTUALIZAR: carga el producto en el formulario y guarda el cambio en el backend", async () => {
    spyOn(window, "scrollTo"); // mock: evita el scroll real
    const { container } = await renderProductos();

    fireEvent.click(screen.getAllByTitle("Editar")[0]);
    expect(screen.getByText("Editando producto #1")).toBeTruthy();
    expect(container.querySelector('[name="categoriaId"]').value).toBe("1");

    escribir(container, "precio", "99000");
    fireEvent.click(screen.getByText("ACTUALIZAR"));

    expect(await screen.findByText("$99.000")).toBeTruthy();
    expect(catalogo.productos[0].precio).toBe(99000);
    expect(screen.getByText("Nuevo producto")).toBeTruthy(); // vuelve a modo crear
  });

  it("ACTUALIZAR un producto en oferta conserva su precio de oferta en el formulario", async () => {
    spyOn(window, "scrollTo");
    const { container } = await renderProductos();

    fireEvent.click(screen.getAllByTitle("Editar")[1]); // Conjunto Deportivo F1, en oferta

    expect(container.querySelector('[name="oferta"]').checked).toBe(true);
    expect(container.querySelector('[name="precioOferta"]').value).toBe("69000");
  });

  it("ELIMINAR: solo borra si el usuario confirma (mock de window.confirm)", async () => {
    const spyConfirm = spyOn(window, "confirm").and.returnValue(false);
    await renderProductos();

    fireEvent.click(screen.getAllByTitle("Eliminar")[0]);
    expect(spyConfirm).toHaveBeenCalledWith("¿Eliminar este producto?");
    expect(catalogo.productos.length).toBe(12); // canceló: no se borra

    spyConfirm.and.returnValue(true);
    fireEvent.click(screen.getAllByTitle("Eliminar")[0]);
    await esperar(() => screen.queryByText("Chaqueta Oficial F1") === null);
    expect(catalogo.productos.length).toBe(11);
  });

  it("ELIMINAR un producto ya vendido muestra el 409 del backend y lo deja en la lista", async () => {
    catalogo.vendidos.add(1);
    spyOn(window, "confirm").and.returnValue(true);
    await renderProductos();

    fireEvent.click(screen.getAllByTitle("Eliminar")[0]);

    expect(await screen.findByText("El producto 1 ya fue vendido y no se puede eliminar")).toBeTruthy();
    expect(screen.getByText("Chaqueta Oficial F1")).toBeTruthy();
  });

  it("CANCELAR limpia el formulario de edición", async () => {
    spyOn(window, "scrollTo");
    await renderProductos();
    fireEvent.click(screen.getAllByTitle("Editar")[0]);
    fireEvent.click(screen.getByText("CANCELAR"));
    expect(screen.getByText("Nuevo producto")).toBeTruthy();
  });
});

describe("Admin: mantenedor de usuarios", () => {
  let usuarios;
  beforeEach(() => ({ usuarios } = prepararAdmin()));
  afterEach(cleanup);

  async function renderUsuarios() {
    const vista = renderAdmin("/admin/usuarios");
    await screen.findByText("cliente@gmail.com");
    return vista;
  }

  it("lista las cuentas del backend con su rol", async () => {
    await renderUsuarios();

    expect(screen.getByText("admin@duoc.cl")).toBeTruthy();
    expect(screen.getAllByTitle("Eliminar").length).toBe(3);
    const filaVendedor = screen.getByText("vendedor@duoc.cl").closest("tr");
    expect(within(filaVendedor).getByText("VENDEDOR")).toBeTruthy();
  });

  it("muestra el error si el backend no entrega los usuarios", async () => {
    simularBackend({ "GET /usuarios": () => errorApi(403, "No tienes permiso para realizar esta acción") });
    renderAdmin("/admin/usuarios");
    expect(await screen.findByText("No tienes permiso para realizar esta acción")).toBeTruthy();
  });

  it("agrega un usuario nuevo con rol vendedor y contraseña", async () => {
    const { container } = await renderUsuarios();
    escribir(container, "nombre", "Nueva Vendedora");
    escribir(container, "correo", "nueva@duoc.cl");
    escribir(container, "contrasena", "abcd");
    escribir(container, "rol", "ROLE_VENDEDOR");
    fireEvent.click(screen.getByText("AGREGAR"));

    expect(await screen.findByText("nueva@duoc.cl")).toBeTruthy();
    expect(usuarios.usuarios.length).toBe(4);
    expect(usuarios.usuarios[3].rol).toBe("ROLE_VENDEDOR");
  });

  it("no envía nada si faltan datos o la contraseña es corta", async () => {
    const { container } = await renderUsuarios();

    fireEvent.click(screen.getByText("AGREGAR"));
    expect(screen.getByText("Nombre y correo son obligatorios.")).toBeTruthy();

    escribir(container, "nombre", "Solo");
    escribir(container, "correo", "solo@duoc.cl");
    escribir(container, "contrasena", "123");
    fireEvent.click(screen.getByText("AGREGAR"));
    expect(screen.getByText("La contraseña debe tener al menos 4 caracteres.")).toBeTruthy();
    expect(usuarios.usuarios.length).toBe(3);
  });

  it("un correo ya registrado muestra el 409 del backend y conserva el formulario", async () => {
    const { container } = await renderUsuarios();
    escribir(container, "nombre", "Otro");
    escribir(container, "correo", "admin@duoc.cl");
    escribir(container, "contrasena", "abcd");
    fireEvent.click(screen.getByText("AGREGAR"));

    expect(await screen.findByText("El correo admin@duoc.cl ya está registrado")).toBeTruthy();
    expect(container.querySelector('[name="nombre"]').value).toBe("Otro");
  });

  it("ACTUALIZAR: sin contraseña nueva envía null y cambia el rol", async () => {
    spyOn(window, "scrollTo");
    let enviado;
    simularBackend({
      "PUT /usuarios/:id": (peticion) => {
        enviado = peticion.cuerpo;
        return usuarios.rutas["PUT /usuarios/:id"](peticion);
      },
    });
    const { container } = await renderUsuarios();

    fireEvent.click(screen.getAllByTitle("Editar")[2]); // cliente
    expect(screen.getByText("Editando usuario #3")).toBeTruthy();
    expect(container.querySelector('[name="contrasena"]').value).toBe("");
    escribir(container, "rol", "ROLE_VENDEDOR");
    fireEvent.click(screen.getByText("ACTUALIZAR"));

    expect(await screen.findByText("Nuevo usuario")).toBeTruthy();
    expect(enviado.contrasena).toBe(null);
    expect(enviado.rol).toBe("ROLE_VENDEDOR");
    expect(usuarios.usuarios[2].rol).toBe("ROLE_VENDEDOR");
  });

  it("el administrador no puede quitarse su propio rol (409 del backend)", async () => {
    spyOn(window, "scrollTo");
    const { container } = await renderUsuarios();

    fireEvent.click(screen.getAllByTitle("Editar")[0]); // admin
    escribir(container, "rol", "ROLE_CLIENTE");
    fireEvent.click(screen.getByText("ACTUALIZAR"));

    expect(await screen.findByText("No puedes cambiar tu propio rol")).toBeTruthy();
    expect(usuarios.usuarios[0].rol).toBe("ROLE_ADMIN");
  });

  it("CANCELAR deja el formulario en modo crear", async () => {
    spyOn(window, "scrollTo");
    await renderUsuarios();
    fireEvent.click(screen.getAllByTitle("Editar")[1]);
    fireEvent.click(screen.getByText("CANCELAR"));
    expect(screen.getByText("Nuevo usuario")).toBeTruthy();
  });

  it("no elimina el usuario si se cancela la confirmación", async () => {
    spyOn(window, "confirm").and.returnValue(false);
    await renderUsuarios();
    fireEvent.click(screen.getAllByTitle("Eliminar")[2]);
    expect(usuarios.usuarios.length).toBe(3);
  });

  it("elimina un usuario cuando se confirma", async () => {
    spyOn(window, "confirm").and.returnValue(true);
    await renderUsuarios();

    fireEvent.click(screen.getAllByTitle("Eliminar")[2]);

    await esperar(() => screen.queryByText("cliente@gmail.com") === null);
    expect(usuarios.usuarios.length).toBe(2);
  });

  it("el administrador no puede eliminar su propia cuenta (409 del backend)", async () => {
    spyOn(window, "confirm").and.returnValue(true);
    await renderUsuarios();

    fireEvent.click(screen.getAllByTitle("Eliminar")[0]);

    expect(await screen.findByText("No puedes eliminar tu propia cuenta")).toBeTruthy();
    expect(screen.getByText("admin@duoc.cl")).toBeTruthy();
  });
});
