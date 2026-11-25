# Retomar la Evaluación Parcial 3 (DSY1104) desde otro equipo

Documento de traspaso: contiene todo lo necesario para continuar el trabajo sin depender de la sesión ni del PC donde se inició. Última actualización: 2026-11-25 (Fases 5 y 6).

---

## 0. Dónde quedamos y qué sigue

**Hecho en la rama `eva3_dev`:**

- Merge de `dev` (arquitectura EP3 inicial) y limpieza de pnpm.
- Microservicios retirados de la rama (siguen en `dev`).
- Carpetas renombradas: `frontend/` y `backend/`.
- Backend corregido: `pom.xml` con Spring Boot 4.1.3, Java 21, Flyway, driver MySQL, springdoc, jjwt 0.13 y Spring Modulith 2.1.3.
- `docker-compose.yml` con MySQL 8.4, `.env.example` y `application.yml` por variables de entorno.
- **`backend/ARQUITECTURA.md`**: la arquitectura acordada, con las 23 reglas. Leerlo antes de escribir código de backend.
- Esqueleto de los módulos `usuarios`, `catalogo`, `ventas` y `shared`, con sus contratos públicos (`CatalogoApi`, `UsuariosApi`) y el test `ModularidadTest` (pasa).
- **Migraciones Flyway** en `db/migration/<módulo>/` (parte 3 y 4): `usuarios/V1` y `V4`, `catalogo/V2` y `V5`, `ventas/V3`. Crean las 5 tablas con claves foráneas, restricciones `CHECK` e índices, y siembran las 3 cuentas (contraseña con BCrypt) y el catálogo de 12 productos. Flyway las aplica al arrancar el backend.
- **Entidades JPA y repositorios** de los tres módulos. Hibernate valida el esquema al arrancar. `ventas` guarda `usuarioId` y `productoId` sin relación JPA hacia otros módulos.

- **Servicios** (parte 5): `UsuarioService`, `CategoriaService`, `ProductoService`, `BoletaService` y las fachadas `CatalogoApiService` y `UsuariosApiService`. El checkout descuenta stock con bloqueo de fila (`SELECT … FOR UPDATE`) en orden de id, cobra el precio vigente del catálogo, aplica cupones (`Cupon`: `F1AUDI` 10 %, `NEUBURG2026` 15 %) y revierte todo si algo falla. `BoletaServiceTest` (Mockito) cubre esas reglas.

- **Controladores, DTOs, errores y Swagger** (parte 6): `CategoriaController`, `ProductoController`, `UsuarioController` (listar, obtener y crear) y `BoletaController` (listar y obtener), todos bajo `/api/v1` y con `@PreAuthorize`. `GlobalExceptionHandler` entrega siempre un `ApiError` (400, 401, 403, 404, 409, 500). `SecurityConfig` es un esqueleto cerrado por defecto: solo son públicos Swagger, `/api/v1/auth/**` y los GET de productos y categorías; lo demás responde 401 hasta que exista el JWT. CORS permite `http://localhost:5173` (se cambia con `app.cors.allowed-origins`). Swagger UI: `/swagger-ui.html`.

- **Pruebas** (parte 7): 103 pruebas, todas en verde.
  - **Unitarias con Mockito:** los servicios de usuarios, catálogo y boletas, y los cupones.
  - **Controladores con MockMvc:** la matriz de roles (200, 401 y 403), el formato de error y que ninguna respuesta exponga contraseñas.
  - **Integración con Testcontainers (`mysql:8.4`):** migraciones, restricciones de la base, checkout completo, reversión del stock y dos compras simultáneas. Usan un contenedor propio, independiente del `docker-compose.yml`, y necesitan Docker en ejecución.

- **Seguridad con JWT** (Fase 3): 143 pruebas, todas en verde.
- **OpenAPI completo** (backend): todos los endpoints con `@Operation`, `operationId`, `@Parameter` y `@ApiResponse`; todos los DTOs y `ApiError` con `@Schema` (descripción y ejemplo); 400/401/403 y el formato de error agregados por `OpenApiConfig`. `OpenApiCoberturaTest` (5 pruebas) exige que `/v3/api-docs` esté completo: 148 pruebas en total.
  - `JwtService` (jjwt 0.13, HMAC-SHA256) emite un token de **acceso de 15 minutos** (id, correo y rol) y uno de **refresco de 7 días** (solo el id). Sin estado: no se guardan en la base; cerrar sesión es borrarlos en el frontend.
  - `JwtAuthFilter` arma la sesión con el rol del token, sin consultar la base. Un token vencido o alterado no bloquea las rutas públicas; en las protegidas responde 401 con el motivo.
  - `POST /auth/login`, `/auth/registro` (crea un cliente y deja la sesión iniciada) y `/auth/refresh` (relee al usuario: el token nuevo trae su rol actual).
  - `POST /boletas` y `GET /boletas/mias` para **cliente y administrador**, con el id del comprador tomado del token. `PUT` y `DELETE /usuarios/{id}` para el administrador.
  - Los 401 y 403 de los filtros también salen con el formato `ApiError`.
  - La clave se lee de `JWT_SECRET` en el `.env` (ver `.env.example`). **Sin ella el backend no arranca.**

- **Frontend de `backup` integrado** (Fase 4.1): se hizo con un `git merge` de `origin/backup`, que conserva sus 9 commits. Trae las 94 pruebas con 100 % de cobertura, ErrorBoundary, página 404, menús responsivos y el filtro de categorías en la URL. Se verificó con Node 26.13: `npm test` da `TOTAL: 94 SUCCESS`, y `npm run lint` y `npm run build` pasan sin advertencias.
  - `Home.jsx` y `Login.jsx` quedaron con la versión de `backup` (datos simulados en `localStorage`); las de `eva3_dev` llamaban a endpoints que no existen.
  - Se retiró `services/api.js` (cliente antiguo, sin usos). El cliente nuevo se escribe en 4.2.
  - `frontend/.node-version` pasó a 26 y el README del frontend se ajustó a la nueva estructura.
  - **Hoy el frontend no usa el backend**: tienda, carrito, login y administración funcionan con `localStorage`. Conectarlos es la Fase 4.2 a 4.4.

- **Sesión del frontend con el backend** (Fase 4.2): 142 pruebas, todas en verde.
  - `services/api.js`: cliente HTTP con `Authorization: Bearer`. Renueva el token de acceso una sola vez (compartido entre solicitudes simultáneas) si venció o si el backend responde 401, y repite la solicitud; si el refresco falla, cierra la sesión. Los errores llegan como `ErrorApi` con el mensaje del backend.
  - `services/sesion.js`: tokens y usuario en `localStorage` (sobreviven a recargas); descarta la sesión si el token de refresco venció o el valor está dañado.
  - `context/AuthContext.jsx` (`useAuth`): usuario, login, registro y cierre de sesión. Se entera también de los cambios hechos por el cliente HTTP.
  - `Login` y `Registro` usan el backend; el registro deja la sesión iniciada. El Navbar y el panel muestran al usuario y el botón **Cerrar Sesión**. Administrador y vendedor entran a `/admin`; el cliente, a la tienda.
  - Cobertura: mínimo global 90 % y **100 % obligatorio** en `src/services/`, `src/context/` y `src/utils/` (lo exige `karma.config.cjs`). Hoy todo está al 100 %.
  - Se quitó el `define` de `IS_REACT_ACT_ENVIRONMENT` en Karma: impedía que Testing Library esperara actualizaciones asíncronas sin advertencias.

- **Restricciones de acceso por rol en el frontend** (Fase 4.3): rutas protegidas y menús por rol. **Sin commitear** (junto con la 4.4): se decide la autoría de los commits antes de confirmarlos.
  - `utils/roles.js`: matriz de permisos (`PERMISOS`) y `tieneRol`. `components/RutaProtegida.jsx` la aplica: sin sesión lleva al login y vuelve a la ruta pedida; con un rol sin permiso muestra "Acceso denegado" (403).
  - Rutas protegidas: `/checkout` (cliente y administrador) y `/admin` (administrador y vendedor), con un permiso propio para cada sección.
  - Vendedor: entra a `/admin/productos`, ve solo Productos y Órdenes en el menú, y los productos en modo lectura (con su detalle). El Navbar muestra el enlace **Panel** a administrador y vendedor.
  - Nuevas `/admin/ordenes` y `/admin/ordenes/:id`, que ya leen `GET /api/v1/boletas` del backend (`hooks/useConsultaApi.js`).

- **Datos del frontend desde la API** (Fase 4.4): 192 pruebas, todas en verde, con 100 % de cobertura (global y en los archivos críticos). **Sin commitear.**
  - Catálogo (Home, Ofertas, Categorías, detalle), panel (resumen, productos, usuarios) y órdenes leen y escriben en `/api/v1` con `hooks/useConsultaApi.js`, con estados de carga y error (`components/EstadoConsulta.jsx`). `services/catalogo.js` adapta los productos entre el backend y las vistas.
  - **Checkout:** la pasarela sigue simulada (la tarjeta `4000000000000002` se rechaza sin tocar el backend). Con otra tarjeta válida registra la compra en `POST /boletas` (`services/ventas.js` agrupa los repetidos del carrito y envía el código del cupón); el total y el N° de pedido mostrados son los del servidor. Si falla (sin stock, producto eliminado…) se conserva el carrito y se muestra el motivo.
  - Administración de usuarios completa: crear, editar (contraseña opcional) y eliminar, con los tres roles y los avisos del backend (correo repetido, cuenta propia, usuario con compras).
  - Se eliminaron `data/productos.js`, `data/usuarios.js` y sus pruebas; `formatearPrecio` pasó a `utils/formato.js`. Solo el carrito sigue en `localStorage`.
  - **Verificado contra el backend real** (no solo con el simulado de las pruebas): 23 comprobaciones del contrato (formas de datos, cupón, descuento de stock, 409 sin stock, 403 por rol y reglas de usuarios). Después se devolvió la base a su estado inicial.
  - Pruebas: en Jasmine, `waitFor(() => expect(...))` no espera (los `expect` no lanzan); usar `esperar(() => condición)` de `tests/helpers.js`. `simularBackend` acumula rutas y admite `:parametros`.

- **Prueba de punta a punta en Chrome real** (Fase 5): 22 pasos contra el sistema completo (frontend, backend y MySQL), todos correctos: catálogo, ofertas, categorías, login y error de credenciales, registro, sesión que sobrevive a la recarga, carrito con cupón, compra con N° de pedido y total del servidor, pago rechazado, sin stock (409), acceso denegado, ruta protegida con vuelta a la página pedida, CRUD de productos y usuarios (con los 409), órdenes y detalle, vendedor en solo lectura, menú móvil, Swagger y servidor caído. Se hizo con un script sobre el protocolo DevTools de Chrome (sin dependencias nuevas) que **no está en el repo**; para repetirlo a mano, seguir el guion de `docs/Guion_Presentacion_EP3.md`.
- **Documentación entregable** (Fase 6), en `docs/`:
  - `Anexo2_Documentacion_APIs_e_Integracion.docx`: 22 endpoints, roles, errores, cómo se integra el frontend y 19 capturas de verificación.
  - `Anexo3_Documentacion_APIs.xlsx`: la misma API en la planilla de la plantilla.
  - `Anexo4_Manual_de_Usuario.docx`: instalación, uso de la tienda y del panel por rol, y solución de problemas, con 31 capturas (número, título, imagen con borde negro de 1 px y nota).
  - `Guion_Presentacion_EP3.md`: preparación, recorrido de 15 minutos con tiempos, quién responde qué y preguntas probables.
  - `docs/capturas/`: las 31 capturas del recorrido.
  - Las plantillas originales están en `EVA3/` (fuera del repo). Los documentos se generaron con la librería `docx` y `openpyxl`; se validaron contra el esquema de Word, pero **no se abrieron en Word**: conviene abrirlos y revisar saltos de página y la numeración de los pasos.

**Siguiente paso:** revisar los documentos en Word, actualizar el ERS (el PDF de la EP2 sigue vigente en `frontend/docs/`, pero describe localStorage) y preparar la presentación. Pendientes menores: página «Mis compras» para el cliente (el endpoint `GET /boletas/mias` ya existe), cookies `httpOnly` en vez de `localStorage` y decidir cuándo integrar `eva3_dev` con `main`.

Lo que el frontend necesita saber de la API (Fase 4):

- `POST /api/v1/auth/login` con `{correo, contrasena}` devuelve `{tokenAcceso, tokenRefresco, tipoToken, expiraEn, usuario: {id, nombre, correo, rol, creadoEn}}`. `/auth/registro` (`{nombre, correo, contrasena}`) responde lo mismo con 201.
- Cada solicitud protegida lleva `Authorization: Bearer <tokenAcceso>`. Ante un 401, llamar una vez a `POST /api/v1/auth/refresh` con `{tokenRefresco}`, guardar el par nuevo y repetir la solicitud; si el refresco también da 401, cerrar sesión.
- `POST /api/v1/boletas`: `{items: [{productoId, cantidad}], tipoEntrega: "DESPACHO" | "RETIRO", direccionEnvio, ciudad, cuponCodigo}`. No se envían precios.
- Todo error trae `{fecha, estado, error, mensaje, ruta, detalles}`; `mensaje` está en español y se puede mostrar tal cual.

### Qué modelo y esfuerzo usar en cada parte

| Parte | Qué incluye | Modelo | Esfuerzo |
|---|---|---|---|
| ✅ 1 y 2 | Documento de arquitectura, Modulith y esqueleto | Sonnet 5.5 | medio |
| ✅ 3 | `V1__esquema.sql`: las 5 tablas, claves, tipos, índices, roles | Opus 5.5 | alto |
| ✅ 4 | Datos semilla con hashes BCrypt, entidades JPA y repositorios | Sonnet 5.5 | medio |
| ✅ 5 | Servicios: boleta, descuento de stock, totales, cupones, reglas por rol | **Opus 5.5** | **alto** |
| ✅ 6 | Controladores, DTOs y anotaciones de Swagger | Sonnet 5.5 | bajo o medio |
| ✅ 7 | Pruebas: Mockito, MockMvc y Testcontainers | Sonnet 5.5 | medio |
| ✅ Fase 3 | JWT, BCrypt, filtro, roles y refresco de token | Opus 5.5 | alto |
| ✅ 4.1 | Traer el frontend de `backup` a `eva3_dev` sin perder sus 94 pruebas | Sonnet 5.5 | medio |
| ✅ 4.2 | Cliente HTTP con `Bearer` y refresco automático, `AuthContext`, sesión persistente y cierre de sesión | **Opus 5.5** | **alto** |
| ✅ 4.3 | Rutas protegidas y menús según el rol (administrador, vendedor, cliente) | Sonnet 5.5 | medio |
| ✅ 4.4 | Pasar las páginas de localStorage a la API: catálogo, detalle, registro, checkout y CRUD de administración | Sonnet 5.5 | medio |

Después siguen las Fases 5 (pruebas de frontend) y 6 (documentación); ver la sección 9.

### Decisiones ya tomadas (no volver a discutirlas)

- Monolito modular con capas CSR dentro de cada módulo. Estructura `api/` (público) + `internal/{web,service,repository,domain}` (privado). Spring Modulith verifica los límites.
- MySQL 8.4 en Docker; esquema con **Flyway**; Hibernate solo valida.
- El checkout **exige sesión iniciada**: `boletas.usuario_id` es obligatorio (no hay compra como invitado).
- Pruebas de integración con **Testcontainers `mysql:8.4`** (requiere Docker).
- Compran el **cliente y el administrador** (el administrador tiene acceso total); el vendedor no compra.
- Token de refresco **JWT sin estado** (no hay tabla de tokens); acceso de 15 minutos y refresco de 7 días.
- En el navegador, los tokens se guardan en **`localStorage`** (sesión persistente ante recargas).
- Cobertura del frontend: mínimo global de 90 % y 100 % en los archivos críticos (`src/services/`, `src/context/`, `src/utils/`).
- Los commits del frontend desde la Fase 4.2 van **a nombre del colega como autor, con BnjmnD04 como coautor** (`Co-authored-by`).
- Spring Boot **4.1.3** y Java **21**. (La 4.2.0 salió el 19-nov-2026; se prefirió la 4.1.x por ser una versión `.0` recién publicada.)
- El frontend mejorado de la rama `backup` ya está integrado en `eva3_dev` (Fase 4.1).

### Pendiente de decidir

- Cuándo y cómo se integra `eva3_dev` en `main` con el colega.
- Si el nombre interno del frontend (`package.json`, título de `index.html`) pasa de `audi-f1-store` a `frontend` / "Audi F1 Store". Es un cambio chico y se hace junto con el `frontend/README.md`, que es una plantilla antigua.

---

## 1. Objetivo

Entregar la **EP3 de Desarrollo Fullstack II** (40 % de la asignatura): integrar la tienda React con un backend Spring Boot, base de datos, JWT y roles.

---

## 2. Repositorio y ramas

Repo: `https://github.com/McRodriFly/Fullstack-02`

| Rama | Contenido |
|---|---|
| `main` | Línea de integración con el colega (frontend EP1 + informe de cobertura). No se toca sin avisar. |
| `dev` | Arquitectura EP3 inicial: frontend en `audi-f1-store/`, monolito `audi-f1-api/` y `audi-f1-microservices/`. Solo referencia. |
| `backup` | Frontend **mejorado de la EP2**: 94 pruebas, 100 % de cobertura, ErrorBoundary, página 404, menús responsivos y filtro de categorías en la URL. Ver sección 7. |
| `eva3_dev` | **Rama de trabajo.** Es la que hay que continuar. |

Estructura en `eva3_dev`:

```text
Fullstack-02/
├── docker-compose.yml     MySQL 8.4
├── .env.example           variables de conexión sin secretos
├── frontend/              React 19 + Vite 8 + Bootstrap (pruebas Karma/Jasmine), solo npm
└── backend/               Spring Boot 4.1.3, Java 21, MySQL + Flyway, Modulith
    ├── ARQUITECTURA.md
    └── src/main/java/com/audi/store/{shared,usuarios,catalogo,ventas}
```

---

## 3. Reglas de trabajo (importantes)

1. **Commits siempre a nombre del usuario** (`BnjmnD04`), **sin `Co-Authored-By`** ni ninguna atribución a herramientas de IA. Tras cada commit verificar: `git log -1 --format='%an | %B'`.
2. **Solo npm** en el repo (`package-lock.json`). No subir `pnpm-lock.yaml`, `pnpm-workspace.yaml` ni referencias a pnpm.
3. **No subir archivos personales**: rúbrica y anexos (`EVA3/`), resúmenes de clases (`gemini-code-*.md`), la guía personal, `proyectos_clases/` ni `evaluaci_n_parcial_2_dsy1104.md`. Se excluyen con `.git/info/exclude` (ver sección 4).
4. Commits separados por tema, con prefijo (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `build:`). La rúbrica evalúa el uso de GitHub y el profesor pregunta por los cambios.
5. Comentarios del código solo técnicos, orientados a otros desarrolladores, en español. Javadoc donde aporta (ver `ARQUITECTURA.md`, sección 8). Sin referencias a evaluaciones, rúbricas ni "requisitos".
6. Nunca `push --force` a `main` sin avisar al colega.
7. Antes de hacer `git add`, revisar con `git status` que no entren archivos personales ni el `.env`.

---

## 4. Preparar otro equipo (por ejemplo, el del trabajo)

### Herramientas

| Herramienta | Versión | Para qué |
|---|---|---|
| Git | cualquiera reciente | Control de versiones |
| Node.js | **26 LTS** (26.13.1 o posterior) | Frontend |
| JDK | **21** (Temurin 21.0.13 o posterior; Spring Boot 4.1 exige 17 o superior) | Backend |
| Docker Desktop | reciente, con WSL2 en Windows | MySQL 8.4 |
| VS Code + Extension Pack for Java | — | IDE del backend |
| VS Code + Spring Boot Extension Pack (`vmware.vscode-boot-dev-pack`) | — | Panel de proyectos Spring |

Maven no hace falta instalarlo: `backend/` trae `mvnw` (`mvnw.cmd` en Windows).

**Si el equipo del trabajo no permite instalar Docker Desktop** (suele requerir permisos de administrador y virtualización): se puede instalar MySQL 8.4 directamente y definir en `.env` los mismos valores (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`). El backend no distingue de dónde viene la base. Las pruebas con Testcontainers sí necesitan Docker.

### Clonar y configurar

```bash
git clone https://github.com/McRodriFly/Fullstack-02.git
cd Fullstack-02
git checkout eva3_dev

# Importante: que los commits salgan a nombre del usuario.
# Copiar el nombre y el correo desde un commit existente:
git log -1 --format='%an <%ae>'
git config user.name  "<nombre del commit>"
git config user.email "<correo del commit>"
```

Para hacer `git push` desde otro equipo hay que autenticarse: con HTTPS, el administrador de credenciales de Git abre el navegador la primera vez (o se usa un token personal de GitHub). El equipo original usa un alias SSH, que no existe en el otro.

### Variables de entorno y base de datos

```bash
cp .env.example .env      # editar las contraseñas y JWT_SECRET; .env está ignorado por Git
docker compose up -d
```

### Frontend

```bash
cd frontend
npm ci
npm run dev        # http://localhost:5173
npm test           # Karma + Jasmine en Chrome Headless (requiere Chrome instalado)
```

### Backend (Windows)

`mvnw.cmd` necesita `JAVA_HOME` apuntando al JDK real. El acceso directo `C:\Program Files\Common Files\Oracle\Java\javapath` que aparece en el PATH **no sirve**. En PowerShell:

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.x.x"    # ajustar a la ruta instalada
cd backend
.\mvnw.cmd -B clean "-Dtest=ModularidadTest" test       # verifica los límites entre módulos
.\mvnw.cmd -B -DskipTests compile
```

Con MySQL levantado, el backend arranca y Flyway aplica las migraciones (`.\mvnw.cmd -B clean test` lo comprueba). Expone la API en el puerto 8080.

### Archivos que NO están en el repo

Hay que copiarlos a mano desde el equipo original (pendrive, nube, etc.) si se necesitan. En la raíz del repo y excluidos de Git:

- `EVA3/`: rúbrica (`DSY1104 Evaluación Parcial 3_EE_EP_Estudiante.pdf`) y los anexos 1 a 4. El resumen está en la sección 5.
- `evaluaci_n_parcial_2_dsy1104.md`, `gemini-code-*.md`, `proyectos_clases/`, `GUIA_DEL_PROYECTO.md`: material personal de la EP2. Para el trabajo de la EP3 no hacen falta.

Para que Git no los muestre ni los suba, agregar al final de `.git/info/exclude` (archivo local de cada clon):

```text
pnpm-lock.yaml
pnpm-workspace.yaml
evaluaci_n_parcial_2_dsy1104.md
gemini-code-*.md
proyectos_clases/
GUIA_DEL_PROYECTO.md
EVA3/
```

### Si se usa Claude Code en el otro equipo

La memoria y la barra de estado de Claude Code son locales de cada PC y no viajan con el repo. Al abrir una sesión nueva, pedir que lea este archivo y `backend/ARQUITECTURA.md`, y recordar las reglas de la sección 3.

---

## 5. Resumen de la rúbrica EP3

**Ponderación:** 40 % entrega del encargo (grupal) y 60 % presentación (individual). Equipos de hasta 3 personas, 1 semana.

### Situación 1: encargo (40 %)

| Indicador | Qué evalúa | Peso |
|---|---|---|
| IE3.1.1 | Backend con conexión a BD, lógica de negocio y modelos de datos según el cliente. | 8 % |
| IE3.2.1 | API REST con Spring Boot: CRUD completo y endpoints visibles en **Swagger**. | 8 % |
| IE3.2.2 | Integración backend–frontend por API REST y flujo de datos justificado. | 6 % |
| IE3.3.1 | Autenticación en el backend con **roles** y **JWT**. | 6 % |
| IE3.3.2 | Gestión de sesión en el frontend, persistente ante recargas. | 6 % |
| IE3.3.3 | Restricciones de acceso en el frontend según el rol. | 6 % |

### Situación 2: presentación individual (60 %)

IE3.1.2 (12 %), IE3.2.3 (12 %), IE3.2.4 (10 %), IE3.3.4 (10 %), IE3.3.5 (8 %), IE3.3.6 (8 %). Son los mismos temas, explicados en voz alta. Formato: 15 minutos de demo más 5 de preguntas, con el sistema funcionando integrado. Cada integrante responde preguntas sobre los cambios hechos en GitHub.

### Instrucciones específicas del Anexo 1

- Base de datos relacional: MySQL, Oracle cloud o Firebase.
- Repositorios y servicios en Spring Boot; lógica de negocio encapsulada **y testeada**.
- Controladores REST con CRUD y **versionado de rutas** (`/api/v1/...`).
- **Swagger** para documentar los endpoints.
- El frontend usa `fetch` o `axios`.
- Spring Security + JWT. Acceso restringido por permisos.
- Repo remoto en GitHub con commits claros y tareas repartidas.

### Roles

| Rol | Acceso |
|---|---|
| Administrador | Acceso total al sistema. |
| Vendedor | Solo ve la lista y el detalle de **productos** y de **órdenes**. Nada más debe aparecer en su vista. |
| Cliente | Solo la tienda. |

### Modelo de datos propuesto (Figura 1)

```text
USUARIO ──▶ BOLETA ──▶ DETALLE_BOLETA ◀── PRODUCTO ◀── CATEGORIA
```

### Entregables

- Enlace GitHub público del frontend y del backend.
- Frontend y backend comprimidos.
- Documento ERS terminado.
- Manual de usuario con pantallazos detallados (cada imagen numerada, con título, nota y borde de 1 px negro; plantilla en el Anexo 4).
- Documentación de APIs (formato del Anexo 3: método, ruta, descripción, entrada, respuestas, pública/privada, autenticación, roles, observaciones).
- Documento de integración (Anexo 2: endpoints por versión, cómo el frontend los consume, capturas con descripción).

---

## 6. Estado actual frente a la rúbrica

Leyenda: 🔴 no cumple · 🟠 parcial · 🟡 en curso · 🟢 listo en el backend.

| Indicador | Estado | Situación |
|---|---|---|
| IE3.1.1 Backend + BD | 🟢 | Monolito modular con MySQL 8.4, Flyway, entidades, servicios con reglas de negocio y pruebas (Mockito, MockMvc y Testcontainers). |
| IE3.2.1 API REST + Swagger | 🟢 | CRUD bajo `/api/v1`, documentado en Swagger UI (`/swagger-ui.html`) con el botón *Authorize* para el token. |
| IE3.2.2 Integración | 🟢 | Sesión, catálogo, checkout (compra y stock), órdenes y administración de productos y usuarios usan la API REST con JWT. Solo el carrito vive en el navegador. Verificado contra el backend real. |
| IE3.3.1 JWT + roles | 🟢 | Spring Security con JWT (acceso y refresco), BCrypt y `@PreAuthorize` por rol en cada endpoint. |
| IE3.3.2 Sesión en el frontend | 🟢 | `AuthContext` con tokens en `localStorage` (persiste al recargar), `Authorization: Bearer`, renovación automática del token, descarte de sesiones vencidas y botón **Cerrar Sesión**. |
| IE3.3.3 Restricciones en el frontend | 🟢 | `RutaProtegida` y la matriz de `utils/roles.js`: sin sesión se va al login; el cliente no entra al panel; el vendedor solo ve productos (en modo lectura) y órdenes; el administrador ve todo. |
| Presentación | 🟢 | Guion EP3 en `docs/Guion_Presentacion_EP3.md` (recorrido de 15 minutos, reparto de preguntas y respuestas). Falta ensayarlo. |

Otros hallazgos:

- **El frontend de `eva3_dev` ya incluye el trabajo de la EP2** (94 pruebas, ErrorBoundary, 404 y menús responsivos), traído desde `backup` en la Fase 4.1.
- **Documentos EP3 del repo** (`frontend/docs/Informe_Avance_EP3.pdf`, `Manual_de_Usuario_Audi_F1_EP3.pdf`, `Guion_Presentacion_Audi_F1.pdf`): los tres dan error de lectura (PDF dañado) y describen microservicios y H2. Se regeneran en la Fase 6.
- **Pruebas del backend:** `.mvnw.cmd -B clean test` necesita Docker en ejecución (Testcontainers levanta su propio MySQL; no usa el de `docker-compose.yml`). Sin Docker solo se pueden correr las pruebas sin base de datos: `-Dtest="*ServiceTest,*ControllerTest,CuponTest,ModularidadTest"`.
- `docs/coverage.rar` (informe del colega) está en `frontend/docs/`.

---

## 7. Origen del frontend mejorado (rama `backup`)

La rama `backup` contiene 9 commits sobre `d73b6d7`:

1. `build: medir cobertura en Karma y fijar Node 24`
2. `refactor: limpiar advertencias del linter y restos de plantilla`
3. `feat: menús responsivos con estado de React y carrito adaptable`
4. `feat: guardar el filtro de Categorías en la URL con useSearchParams`
5. `feat: agregar ErrorBoundary y página 404`
6. `test: ampliar pruebas a 94 casos con 100% de cobertura`
7. `docs: actualizar README, ERS y documento de cobertura`
8. `refactor: comentarios técnicos y umbral de cobertura en 90 %`
9. `docs: actualizar ERS, cobertura y README`

Integrada en `eva3_dev` con `git merge origin/backup` (Fase 4.1). Como `backup` tiene el frontend en la raíz y `eva3_dev` en `frontend/`, Git llevó los archivos a `frontend/` por detección de renombres y los conflictos se resolvieron a mano. La configuración de cobertura (Karma + Istanbul, umbral de 90 %) escribe el informe en `frontend/coverage/`, que Git ignora.

---

## 8. Reglas de arquitectura

Están completas en **`backend/ARQUITECTURA.md`**. Resumen:

- `usuarios` y `catalogo` solo dependen de `shared`; `ventas` usa `catalogo :: api` y `usuarios :: api`.
- Todo lo que no es `api/` va en `internal/`.
- Controladores con DTOs `record`, sin entidades; lógica y transacciones en `service`; inyección por constructor.
- Rutas `/api/v1`, errores en un formato único, Swagger en cada endpoint.
- Esquema solo con Flyway; montos `DECIMAL(12,0)`; cada detalle de boleta guarda el precio unitario.
- Contraseñas con BCrypt; clave JWT desde variable de entorno; permisos con `@PreAuthorize`.

---

## 9. Plan por fases

| Fase | Contenido | Estado |
|---|---|---|
| 0 | Decisiones; instalar Docker Desktop | ✅ |
| 1 | Infraestructura: `docker-compose.yml`, `.env.example`, `pom.xml`, `application.yml` | ✅ |
| 2 | Monolito modular: arquitectura ✅, esqueleto ✅, esquema y semilla ✅, entidades y repositorios ✅, servicios ✅, controladores y Swagger ✅, pruebas ✅ | ✅ Completa (partes 1 a 7) |
| 3 | Seguridad: JWT, BCrypt, filtro, roles, `@PreAuthorize`, refresco de token | ✅ |
| 4 | Integración con el frontend: 4.1 traer `backup` ✅; 4.2 cliente HTTP y `AuthContext` ✅; 4.3 rutas por rol ✅; 4.4 datos desde la API ✅ | ✅ Completa (4.3 y 4.4 sin commitear) |
| 5 | Calidad: pruebas de backend ✅ (148), de frontend ✅ (192, con 100 % en los archivos críticos) y recorrido de punta a punta en Chrome ✅ (22 pasos) | ✅ Completa |
| 6 | Documentación: Anexos 2, 3 y 4 ✅, guion EP3 ✅, README ✅. Pendiente: actualizar el ERS y revisar los .docx en Word | En curso |

### Matriz de permisos objetivo (`/api/v1`)

| Recurso | Acceso |
|---|---|
| `POST /auth/login`, `/auth/registro`, `/auth/refresh` | Público |
| `GET /productos`, `/productos/{id}`, `/categorias` | Público |
| `POST`, `PUT`, `DELETE` de productos y categorías | Administrador |
| `/usuarios` (CRUD) | Administrador |
| `GET /boletas`, `/boletas/{id}` | Administrador y Vendedor |
| `POST /boletas`, `GET /boletas/mias` | Cliente y Administrador (sesión obligatoria) |

---

## 10. Referencia técnica

### Puertos

| Servicio | Puerto |
|---|---|
| Frontend (Vite) | 5173 |
| Backend | 8080 (Swagger UI en `/swagger-ui.html`) |
| MySQL | 3306 (solo accesible desde el propio equipo) |

### Usuarios semilla (migración `usuarios/V4`)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@duoc.cl` | `1234` |
| Vendedor | `vendedor@duoc.cl` | `1234` |
| Cliente | `cliente@gmail.com` | `1234` |

Ya existen en la base de datos tras arrancar el backend; la contraseña se guarda como hash BCrypt.

### Comandos útiles

```bash
# Base de datos
docker compose up -d
docker compose logs -f mysql
docker compose down            # conserva los datos
docker compose down -v         # BORRA los datos

# Frontend
cd frontend && npm ci && npm run dev
npm test
npm run lint
npm run build
```

```powershell
# Backend (PowerShell; JAVA_HOME debe apuntar al JDK real)
cd backend
.\mvnw.cmd -B clean "-Dtest=ModularidadTest" test
.\mvnw.cmd -B -DskipTests compile
```

### Trampas conocidas

- **Usar `clean` al mover o borrar paquetes.** Maven deja clases viejas en `target/` y el test de Modulith las analiza como si existieran.
- **VS Code recrea carpetas `target/` vacías** de proyectos que ya no existen. Son inofensivas y Git las ignora.
- **`JAVA_HOME` mal definido** hace fallar `mvnw.cmd` con "The JAVA_HOME environment variable is not defined correctly".
- Los avisos de Git sobre "LF will be replaced by CRLF" son normales en Windows.

### Dónde está cada cosa en el frontend

- `src/services/catalogo.js` y `ventas.js`: adaptadores de productos y compras; `src/hooks/useConsultaApi.js`: lecturas con carga y error.
- `src/context/CarritoContext.jsx`: estado global del carrito.
- `src/pages/Login.jsx` y `Registro.jsx`: usan `POST /auth/login` y `/auth/registro`.
- `src/pages/admin/*`: panel de administración (sin guardia de acceso).
- `src/services/api.js` y `src/services/sesion.js`: cliente HTTP con JWT y sesión en `localStorage`.
- `src/context/AuthContext.jsx`: sesión global (`useAuth`).
- `src/utils/roles.js` y `src/components/RutaProtegida.jsx`: permisos por rol y guardia de rutas.
- `src/tests/`: 192 pruebas Jasmine con 100 % de cobertura (`npm test`), con un backend simulado en memoria.
