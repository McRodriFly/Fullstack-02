# Retomar la Evaluación Parcial 3 (DSY1104) desde otro equipo

Documento de traspaso: contiene todo lo necesario para continuar el trabajo sin depender de la sesión ni del PC donde se inició. Última actualización: 2026-11-24.

---

## 0. Dónde quedamos y qué sigue

**Hecho y subido a GitHub (rama `eva3_dev`):**

- Merge de `dev` (arquitectura EP3 inicial) y limpieza de pnpm.
- Microservicios retirados de la rama (siguen en `dev`).
- Carpetas renombradas: `frontend/` y `backend/`.
- Backend corregido: `pom.xml` con Spring Boot 4.1.3, Java 21, Flyway, driver MySQL, springdoc, jjwt 0.13 y Spring Modulith 2.1.3.
- `docker-compose.yml` con MySQL 8.4, `.env.example` y `application.yml` por variables de entorno.
- **`backend/ARQUITECTURA.md`**: la arquitectura acordada, con las 22 reglas. Leerlo antes de escribir código de backend.
- Esqueleto de los módulos `usuarios`, `catalogo`, `ventas` y `shared`, con sus contratos públicos (`CatalogoApi`, `UsuariosApi`) y el test `ModularidadTest` (pasa).
- **`V1__esquema.sql`** (parte 3): las 5 tablas con claves foráneas, restricciones `CHECK` e índices. Flyway la aplica al arrancar el backend.

**Siguiente paso: parte 4 de la Fase 2** (`V2__datos_semilla.sql`, entidades JPA y repositorios). Basta Sonnet 5.5 con esfuerzo medio.

### Qué modelo y esfuerzo usar en cada parte

| Parte | Qué incluye | Modelo | Esfuerzo |
|---|---|---|---|
| ✅ 1 y 2 | Documento de arquitectura, Modulith y esqueleto | Sonnet 5.5 | medio |
| ✅ 3 | `V1__esquema.sql`: las 5 tablas, claves, tipos, índices, roles | Opus 5.5 | alto |
| **4** | `V2__datos_semilla.sql` con hashes BCrypt, entidades JPA y repositorios | Sonnet 5.5 | medio |
| **5** | Servicios: boleta, descuento de stock, totales, cupones, reglas por rol | **Opus 5.5** | **alto** |
| 6 | Controladores, DTOs y anotaciones de Swagger | Sonnet 5.5 | bajo o medio |
| 7 | Pruebas: Mockito, MockMvc y Testcontainers | Sonnet 5.5 | medio |
| **Fase 3** | JWT, BCrypt, filtro, roles y refresco de token | **Opus 5.5** | **alto o muy alto** |

Después de esas partes siguen la Fase 4 (integración con el frontend) y las Fases 5 y 6; ver la sección 9.

### Decisiones ya tomadas (no volver a discutirlas)

- Monolito modular con capas CSR dentro de cada módulo. Estructura `api/` (público) + `internal/{web,service,repository,domain}` (privado). Spring Modulith verifica los límites.
- MySQL 8.4 en Docker; esquema con **Flyway**; Hibernate solo valida.
- El checkout **exige sesión iniciada**: `boletas.usuario_id` es obligatorio (no hay compra como invitado).
- Pruebas de integración con **Testcontainers `mysql:8.4`** (requiere Docker).
- Spring Boot **4.1.3** y Java **21**. (La 4.2.0 salió el 19-nov-2026; se prefirió la 4.1.x por ser una versión `.0` recién publicada.)
- El frontend mejorado de la rama `backup` **todavía no se trae**; se integra al llegar a la Fase 4.

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
cp .env.example .env      # editar las contraseñas; .env está ignorado por Git
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

Con MySQL levantado, el backend arranca y Flyway aplica `V1__esquema.sql` (`.mvnw.cmd -B clean test` lo comprueba). Aún no expone endpoints.

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

Leyenda: 🔴 no cumple · 🟠 parcial · 🟡 en curso.

| Indicador | Estado | Situación |
|---|---|---|
| IE3.1.1 Backend + BD | 🟡 | Compila y la conexión a MySQL está configurada. Esqueleto modular listo. **Faltan** el esquema (Flyway), las entidades y la lógica de negocio: el código plano antiguo se eliminó a propósito para rehacerlo dentro de los módulos. |
| IE3.2.1 API REST + Swagger | 🟡 | springdoc declarado en el `pom.xml`. **Faltan** los controladores y sus anotaciones. |
| IE3.2.2 Integración | 🔴 | `frontend/src/services/api.js` tiene 3 funciones. Solo `Home` pide productos al backend (con respaldo en localStorage) y `Login` usa la API. Admin, categorías, ofertas, detalle, registro y checkout siguen contra localStorage (`src/data/*.js`). |
| IE3.3.1 JWT + roles | 🔴 | Sin implementar en la estructura nueva (el código anterior estaba abierto y con contraseñas en texto plano). |
| IE3.3.2 Sesión en el frontend | 🟠 | Guarda `tokenJWT` y `usuarioLogueado` en localStorage (persiste al recargar). No envía `Authorization: Bearer`, no valida expiración, no hay logout visible ni contexto de sesión. |
| IE3.3.3 Restricciones en el frontend | 🔴 | `/admin` no tiene guardia: se entra escribiendo la URL. El Vendedor ve lo mismo que el Administrador. |
| Presentación | 🟠 | El guion existente es de la EP2. Falta guion EP3. |

Otros hallazgos:

- **El frontend de `eva3_dev` no tiene el trabajo de la EP2.** Viene de `dev` (basado en el commit `d73b6d7`): sin ErrorBoundary, 404 ni las 94 pruebas, y con comentarios antiguos como "Migrado de…". Está resuelto en `backup`.
- **Documentos EP3 del repo** (`frontend/docs/Informe_Avance_EP3.pdf`, `Manual_de_Usuario_Audi_F1_EP3.pdf`, `Guion_Presentacion_Audi_F1.pdf`): los tres dan error de lectura (PDF dañado) y describen microservicios y H2. Se regeneran en la Fase 6.
- **Pruebas del backend:** `AudiF1ApiApplicationTests` (`contextLoads`) necesita MySQL corriendo; el único test que pasa hoy sin base de datos es `ModularidadTest`.
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

En `backup` el frontend está en la raíz (`src/`, `package.json`); en `eva3_dev` está en `frontend/`. No sirve un merge directo: hay que traer los archivos por partes (`git checkout backup -- <ruta>` y moverlos a `frontend/`) o hacer `cherry-pick` resolviendo los renombres. La configuración de cobertura (Karma + Istanbul, umbral de 90 %) escribe el informe en `frontend/coverage/`, que Git ignora.

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
| 2 | Monolito modular: arquitectura ✅, esqueleto ✅, V1 esquema ✅, **V2 semilla y entidades ⏳**, servicios, controladores y Swagger, pruebas | En curso (partes 1 a 3 hechas) |
| 3 | Seguridad: JWT, BCrypt, filtro, roles, `@PreAuthorize`, refresco de token | Pendiente |
| 4 | Integración con el frontend: cliente HTTP, `AuthContext`, rutas por rol, migrar datos simulados a la API. Traer el trabajo de `backup` | Pendiente |
| 5 | Calidad: pruebas de backend (Mockito, MockMvc, Testcontainers) y de frontend (sesión y guardias) | Pendiente |
| 6 | Documentación: ERS, manual con pantallazos (Anexo 4), documentación de APIs (Anexo 3), documento de integración (Anexo 2), guion EP3, README | Pendiente |

### Matriz de permisos objetivo (`/api/v1`)

| Recurso | Acceso |
|---|---|
| `POST /auth/login`, `/auth/registro`, `/auth/refresh` | Público |
| `GET /productos`, `/productos/{id}`, `/categorias` | Público |
| `POST`, `PUT`, `DELETE` de productos y categorías | Administrador |
| `/usuarios` (CRUD) | Administrador |
| `GET /boletas`, `/boletas/{id}` | Administrador y Vendedor |
| `POST /boletas`, `GET /boletas/mias` | Cliente (sesión obligatoria) |

---

## 10. Referencia técnica

### Puertos

| Servicio | Puerto |
|---|---|
| Frontend (Vite) | 5173 |
| Backend | 8080 (Swagger UI en `/swagger-ui.html`) |
| MySQL | 3306 (solo accesible desde el propio equipo) |

### Usuarios semilla (a recrear en la migración V2)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@duoc.cl` | `1234` |
| Vendedor | `vendedor@duoc.cl` | `1234` |
| Cliente | `cliente@gmail.com` | `1234` |

Hoy no existen en la base de datos; la V2 los creará con la contraseña guardada como hash BCrypt.

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

- `src/services/api.js`: llamadas HTTP al backend (hoy 3 funciones, con la URL fija `http://localhost:8080/api/v1`).
- `src/data/productos.js`, `src/data/usuarios.js`: "base de datos" simulada en localStorage (a reemplazar por la API).
- `src/context/CarritoContext.jsx`: estado global del carrito.
- `src/pages/Login.jsx`: guarda `tokenJWT` y `usuarioLogueado`.
- `src/pages/admin/*`: panel de administración (sin guardia de acceso).
- `src/tests/`: pruebas Jasmine (en `eva3_dev` solo las 4 originales; las 94 están en `backup`).
