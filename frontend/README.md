# 🏎️ Audi F1 Store — Frontend React

Tienda online oficial (ficticia) de merchandising del equipo **Audi F1 Team**. Proyecto desarrollado para la asignatura **DSY1104 — Desarrollo Fullstack II**.

En esta **Evaluación Parcial 2** se migró la tienda de HTML/CSS/JS vanilla (EP1) a **React**, añadiendo nuevos flujos de navegación (categorías, ofertas, checkout, compra exitosa/fallida y panel de administración) y un sistema de **pruebas unitarias con Jasmine + Karma**.

---

## 🚀 Tecnologías

| Tecnología | Uso |
|---|---|
| **React 19** | Componentes, props, estado, contexto |
| **Vite** | Bundler y servidor de desarrollo |
| **React Router 7** | Navegación entre vistas (SPA), parámetros de ruta y de búsqueda |
| **Bootstrap 5** | Diseño responsivo (móvil / tablet / escritorio) |
| **Bootstrap Icons** | Iconografía del panel admin |
| **Jasmine + Karma** | Pruebas unitarias en navegador real (Chrome Headless) |
| **React Testing Library** | Renderizado, `renderHook` y simulación de eventos en pruebas |
| **karma-coverage + Istanbul** | Medición de cobertura de código |
| **fetch + JWT** | Cliente HTTP del backend con renovación automática del token |
| **localStorage** | Sesión (tokens y usuario) y carrito de compras |

> **Estado:** el frontend ya funciona contra el backend (`../backend`, API REST con JWT): sesión, catálogo, checkout, órdenes y administración de productos y usuarios. Solo el carrito vive en el navegador (`localStorage`) hasta que se paga. El plan está en [`../RETOMAR_EVA3.md`](../RETOMAR_EVA3.md).

## 🔐 Sesión con el backend

- `src/services/api.js` llama a `http://localhost:8080/api/v1` (se cambia con `VITE_API_URL` en un `.env` del frontend). Agrega `Authorization: Bearer` si hay sesión.
- El token de acceso dura 15 minutos. Si venció, o el backend responde 401, el cliente lo renueva una sola vez con el token de refresco (7 días) y repite la solicitud; si varias solicitudes lo necesitan a la vez, comparten el mismo refresco. Si el refresco falla, la sesión se cierra.
- `src/services/sesion.js` guarda los tokens y el usuario en `localStorage`, así la sesión sobrevive a una recarga. Al abrir la app, una sesión con el token de refresco vencido se descarta.
- `src/context/AuthContext.jsx` expone `useAuth()`: `usuario`, `estaAutenticado`, `iniciarSesion`, `registrarse` y `cerrarSesion`. Cerrar sesión descarta los tokens (el backend no los guarda).
- Los datos se consultan con `hooks/useConsultaApi.js` (carga, error y recarga). `services/catalogo.js` adapta los productos entre la forma del backend (`categoriaId`, `imagen`, `precioOferta: null`) y la que usan las vistas.
- **Checkout:** la pasarela de pago es simulada (la tarjeta `4000000000000002` se rechaza sin tocar el backend). Con cualquier otra tarjeta válida se registra la compra en `POST /api/v1/boletas`: el servidor descuenta el stock, cobra los precios vigentes del catálogo y calcula el total (con el cupón). Si no hay stock, el carrito se conserva y se muestra el motivo.
- Tras iniciar sesión, el administrador va a `/admin`, el vendedor a `/admin/productos` y el cliente a la tienda. Si el login se pidió desde una ruta protegida (por ejemplo, el checkout), vuelve a ella.

## 🛡️ Acceso según el rol

La matriz está en `src/utils/roles.js` y `src/components/RutaProtegida.jsx` la aplica a las rutas. El backend vuelve a comprobar cada permiso.

| Rol | Qué ve |
|---|---|
| Sin sesión | La tienda. `/checkout` y `/admin` llevan al login. |
| Cliente | La tienda y el checkout. `/admin` muestra "Acceso denegado" (403). |
| Vendedor | Solo la lista y el detalle de productos (en modo lectura) y de órdenes. No ve el resumen ni usuarios, y no puede pagar. |
| Administrador | Todo: resumen, CRUD de productos y usuarios, órdenes y compras. |

Si la sesión vence mientras se navega por una ruta protegida, se vuelve al login.

## 🛠️ Instalación y ejecución

Requisitos: **Node.js 26** (ver `.node-version`) y npm. Se necesita Google Chrome instalado para las pruebas.

```bash
# 1. Clonar el repositorio
git clone https://github.com/McRodriFly/Fullstack-02.git
cd Fullstack-02/frontend

# 2. Instalar dependencias
npm install

# 3. Levantar el servidor de desarrollo
npm run dev
# → http://localhost:5173
```

### 🧪 Ejecutar las pruebas unitarias

```bash
npm test
```

Ejecuta las **192 pruebas** con **Karma + Jasmine** en Chrome Headless y mide la cobertura. Resultado esperado: `TOTAL: 192 SUCCESS`. Las pruebas usan un backend simulado en memoria (`tests/helpers.js`).

| Métrica de cobertura | Resultado | Mínimo exigido |
|---|---|---|
| Sentencias | 100 % | 90 % |
| Ramas | 100 % | 90 % |
| Funciones | 100 % | 90 % |
| Líneas | 100 % | 90 % |

El reporte navegable queda en `coverage/index.html`. `npm test` falla si la cobertura global baja del 90 % o si un archivo crítico (`src/services/`, `src/context/`, `src/hooks/`, `src/utils/` y `RutaProtegida.jsx`) baja del 100 %.

| Archivo de pruebas | Qué prueba |
|---|---|
| `validadores.spec.js` | Funciones puras: correo, RUT, contraseña, login, registro, contacto y checkout |
| `catalogo.spec.js` | Adaptadores del catálogo y de las ventas (agrupación del carrito), `formatearPrecio` y `describirError` |
| `useConsultaApi.spec.js` | Hook de consultas: carga, error, cambio de ruta, transformación y recarga |
| `CarritoContext.spec.js` | Hook `useCarrito` con `renderHook`, cupones, totales, mocks de `localStorage` y `jasmine.clock()` |
| `ProductCard.spec.js` | Props, renderizado condicional y spy del evento clic |
| `sesion.spec.js` | Vencimiento de tokens, lectura robusta de la sesión guardada y avisos de cambio |
| `api.spec.js` | Cliente HTTP: Bearer, errores del backend, sin conexión y renovación del token (incluidas solicitudes simultáneas) |
| `AuthContext.spec.js` | Sesión persistente ante recargas, login, registro y cierre de sesión |
| `Permisos.spec.js` | Matriz de roles, guardias de rutas (login, 403, sesión vencida), menú del panel y modo lectura del vendedor |
| `Ordenes.spec.js` | Lista y detalle de órdenes contra el backend simulado, estados de carga y error |
| `Login.spec.js` / `Formularios.spec.js` | Login y registro contra un backend simulado (redirección por rol y errores), selects encadenados |
| `Carrito.spec.js` / `Checkout.spec.js` | Flujo de compra completo: cupones, pago aprobado y rechazado |
| `Navegacion.spec.js` | Rutas, Navbar responsivo, toast, página 404 y ErrorBoundary |
| `Admin.spec.js` | Dashboard, CRUD de productos y usuarios, mock de `window.confirm` |

### 📦 Build de producción

```bash
npm run build   # genera la carpeta dist/
npm run lint    # revisión estática del código (oxlint)
```

## 🗺️ Vistas de la aplicación

### Tienda (público/cliente)
| Ruta | Descripción |
|---|---|
| `/` | Home — catálogo completo de productos |
| `/producto/:id` | Detalle de producto con ficha completa |
| `/categorias` | Productos filtrables por categoría (`?cat=Gorras`) |
| `/ofertas` | Solo productos con precio rebajado |
| `/carrito` | Carrito con cupones de descuento |
| `/checkout` | Formulario de datos, entrega y pago (validado) |
| `/compra-exitosa` | Resumen del pedido tras pago aprobado |
| `/compra-fallida` | Aviso de pago rechazado (el carrito se conserva) |
| `/login` | Inicio de sesión contra el backend (JWT), con validación previa del formulario |
| `/registro` | Registro como cliente en el backend, con validación de RUT chileno (módulo 11) |
| `/nosotros` | Historia del proyecto + video |
| `/blog` | Noticias del equipo |
| `/contacto` | Formulario de contacto validado |

### Panel de administración
| Ruta | Descripción |
|---|---|
| `/admin` | Dashboard con KPIs calculados en vivo |
| `/admin/productos` | CRUD completo de productos contra la API (el vendedor solo lo ve) |
| `/admin/ordenes` | Órdenes de compra (desde el backend) |
| `/admin/ordenes/:id` | Detalle de una orden con el precio cobrado por producto |
| `/admin/usuarios` | Mantenedor de usuarios contra la API: crear, editar (contraseña opcional) y eliminar, con los tres roles |

## 🔑 Credenciales de prueba

Cuentas iniciales del backend (contraseña `1234`; requieren el backend en ejecución):

- **Administrador:** `admin@duoc.cl` → panel de administración.
- **Vendedor:** `vendedor@duoc.cl` → panel de administración.
- **Cliente:** `cliente@gmail.com` → tienda.
- **Cupones:** `F1AUDI` (10% dto.) · `NEUBURG2026` (15% dto.).
- **Pago rechazado (demo):** tarjeta `4000000000000002` en el checkout.

## 📁 Estructura del proyecto

```
frontend/src/
├── components/     # Navbar, Footer, ProductCard, ToastCarrito, ErrorBoundary, RutaProtegida
├── hooks/          # useConsultaApi (GET a la API con estado de carga y error)
├── context/        # AuthContext (sesión) y CarritoContext (carrito)
├── data/           # ubicacion.js (regiones y comunas)
├── services/       # api.js (cliente HTTP con JWT), sesion.js, catalogo.js y ventas.js
├── pages/          # Vistas de la tienda
│   └── admin/      # Panel de administración
├── styles/         # CSS migrado de la EP1 + toast
├── tests/          # Pruebas unitarias (Jasmine + Karma) + helpers.js
└── utils/          # validadores.js y roles.js (funciones puras)
```

## 📄 Documentos

- `docs/ERS_AudiF1_Store_V2.pdf` — Especificación de Requisitos del Software (versión actualizada)
- `docs/Cobertura_Testing.pdf` — Documento de cobertura de testing

---

_DSY1104 — Desarrollo Fullstack II · 2026_
