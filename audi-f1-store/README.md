# 🏎️ Audi F1 Store — Frontend React

Tienda online oficial (ficticia) de merchandising del equipo **Audi F1 Team**. Proyecto desarrollado para la asignatura **DSY1104 — Desarrollo Fullstack II**.

En esta **Evaluación Parcial 2** se migró la tienda de HTML/CSS/JS vanilla (EP1) a **React**, añadiendo nuevos flujos de navegación (categorías, ofertas, checkout, compra exitosa/fallida y panel de administración) y un sistema de **pruebas unitarias con Jasmine + Karma**.

---

## 🚀 Tecnologías

| Tecnología | Uso |
|---|---|
| **React 19** | Componentes, props, estado, contexto |
| **Vite** | Bundler y servidor de desarrollo |
| **React Router 7** | Navegación entre vistas (SPA) |
| **Bootstrap 5** | Diseño responsivo (móvil / tablet / escritorio) |
| **Bootstrap Icons** | Iconografía del panel admin |
| **Jasmine + Karma** | Pruebas unitarias en navegador real (Chrome Headless) |
| **React Testing Library** | Renderizado y simulación de eventos en pruebas |
| **localStorage** | Persistencia simulada (productos, usuarios, carrito) |

## 🛠️ Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/<usuario>/audi-f1-store.git
cd audi-f1-store

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

Ejecuta las 22 pruebas con **Karma + Jasmine** en Chrome Headless. Resultado esperado: `TOTAL: 22 SUCCESS`.

### 📦 Build de producción

```bash
npm run build   # genera la carpeta dist/
```

## 🗺️ Vistas de la aplicación

### Tienda (público/cliente)
| Ruta | Descripción |
|---|---|
| `/` | Home — catálogo completo de productos |
| `/producto/:id` | Detalle de producto con ficha completa |
| `/categorias` | Productos filtrables por categoría |
| `/ofertas` | Solo productos con precio rebajado |
| `/carrito` | Carrito con cupones de descuento |
| `/checkout` | Formulario de datos, entrega y pago (validado) |
| `/compra-exitosa` | Resumen del pedido tras pago aprobado |
| `/compra-fallida` | Aviso de pago rechazado (el carrito se conserva) |
| `/login` | Inicio de sesión con validación de dominio |
| `/registro` | Registro con validación de RUT chileno (módulo 11) |
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

- **Admin:** cualquier correo que incluya "admin", ej: `admin@duoc.cl` (contraseña de 4 a 10 caracteres) → redirige al panel de administración.
- **Cliente:** `usuario@gmail.com` (misma regla de contraseña).
- **Cupones:** `F1AUDI` (10% dto.) · `NEUBURG2026` (15% dto.).
- **Pago rechazado (demo):** tarjeta `4000000000000002` en el checkout.

## 📁 Estructura del proyecto

```
src/
├── components/     # Navbar, Footer, ProductCard, ToastCarrito
├── context/        # CarritoContext (estado global del carrito)
├── data/           # productos.js (CRUD), ubicacion.js, usuarios.js
├── pages/          # Vistas de la tienda
│   └── admin/      # Panel de administración
├── styles/         # CSS migrado de la EP1 + toast
├── tests/          # Pruebas unitarias (Jasmine + Karma)
└── utils/          # validadores.js (funciones puras)
```

## 📄 Documentos

- `docs/ERS_AudiF1_Store_V2.pdf` — Especificación de Requisitos del Software (versión actualizada)
- `docs/Cobertura_Testing.pdf` — Documento de cobertura de testing

---

_DSY1104 — Desarrollo Fullstack II · Evaluación Parcial 2 · 2026_
