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
| **localStorage** | Sesión (tokens y usuario) y, por ahora, datos simulados de productos, usuarios y carrito |

> **Estado:** el inicio de sesión, el registro y la sesión ya usan el backend (`../backend`, API REST con JWT). El catálogo, el carrito, el checkout y el panel siguen con datos simulados en `localStorage` hasta la Fase 4.4; el plan está en [`../RETOMAR_EVA3.md`](../RETOMAR_EVA3.md).

## 🔐 Sesión con el backend

- `src/services/api.js` llama a `http://localhost:8080/api/v1` (se cambia con `VITE_API_URL` en un `.env` del frontend). Agrega `Authorization: Bearer` si hay sesión.
- El token de acceso dura 15 minutos. Si venció, o el backend responde 401, el cliente lo renueva una sola vez con el token de refresco (7 días) y repite la solicitud; si varias solicitudes lo necesitan a la vez, comparten el mismo refresco. Si el refresco falla, la sesión se cierra.
- `src/services/sesion.js` guarda los tokens y el usuario en `localStorage`, así la sesión sobrevive a una recarga. Al abrir la app, una sesión con el token de refresco vencido se descarta.
- `src/context/AuthContext.jsx` expone `useAuth()`: `usuario`, `estaAutenticado`, `iniciarSesion`, `registrarse` y `cerrarSesion`. Cerrar sesión descarta los tokens (el backend no los guarda).
- Tras iniciar sesión, administrador y vendedor van a `/admin`; el cliente, a la tienda.

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

Ejecuta las **142 pruebas** con **Karma + Jasmine** en Chrome Headless y mide la cobertura. Resultado esperado: `TOTAL: 142 SUCCESS`.

| Métrica de cobertura | Resultado | Mínimo exigido |
|---|---|---|
| Sentencias | 100 % | 90 % |
| Ramas | 100 % | 90 % |
| Funciones | 100 % | 90 % |
| Líneas | 100 % | 90 % |

El reporte navegable queda en `coverage/index.html`. `npm test` falla si la cobertura global baja del 90 % o si un archivo crítico (`src/services/`, `src/context/` y `src/utils/`) baja del 100 %.

| Archivo de pruebas | Qué prueba |
|---|---|
| `validadores.spec.js` | Funciones puras: correo, RUT, contraseña, login, registro, contacto y checkout |
| `productos.spec.js` | CRUD de la fuente de datos simulada |
| `CarritoContext.spec.js` | Hook `useCarrito` con `renderHook`, cupones, totales, mocks de `localStorage` y `jasmine.clock()` |
| `ProductCard.spec.js` | Props, renderizado condicional y spy del evento clic |
| `sesion.spec.js` | Vencimiento de tokens, lectura robusta de la sesión guardada y avisos de cambio |
| `api.spec.js` | Cliente HTTP: Bearer, errores del backend, sin conexión y renovación del token (incluidas solicitudes simultáneas) |
| `AuthContext.spec.js` | Sesión persistente ante recargas, login, registro y cierre de sesión |
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
| `/admin/productos` | CRUD completo de productos |
| `/admin/usuarios` | Mantenedor de usuarios |

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
├── components/     # Navbar, Footer, ProductCard, ToastCarrito, ErrorBoundary
├── context/        # AuthContext (sesión) y CarritoContext (carrito)
├── data/           # productos.js (CRUD), ubicacion.js, usuarios.js
├── services/       # api.js (cliente HTTP con JWT) y sesion.js (sesión en localStorage)
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
