# Retomar la Evaluación Parcial 3 (DSY1104) desde otro equipo

Documento de traspaso: contiene todo lo necesario para continuar el trabajo sin depender de la sesión ni del PC donde se inició. Estado a fecha 2026-11-23.

---

## 1. Objetivo

Entregar la **EP3 de Desarrollo Fullstack II** (40 % de la asignatura): integrar la tienda React con un backend Spring Boot, base de datos, JWT y roles.

Decisión de arquitectura tomada para esta entrega:

- **Backend como monolito modular** (un solo despliegue Spring Boot, dividido en módulos por dominio).
- **Base de datos MySQL 8.4 en Docker.**
- Los microservicios (Eureka, Gateway, service-productos, service-usuarios) **se retiraron** de `eva3_dev`; siguen disponibles en la rama `dev` y en el historial.

---

## 2. Repositorio y ramas

Repo: `https://github.com/McRodriFly/Fullstack-02`

| Rama | Contenido |
|---|---|
| `main` | Línea de integración con el colega (frontend EP1 + informe de cobertura). |
| `dev` | Commit `53aeb14` con la arquitectura EP3 inicial: frontend movido a `audi-f1-store/`, monolito `audi-f1-api/` y `audi-f1-microservices/`. |
| `backup` | Frontend **mejorado de la EP2**: 94 pruebas, 100 % de cobertura, ErrorBoundary, página 404, menús responsivos y filtro de categorías en la URL. Ver sección 7. |
| `eva3_dev` | **Rama de trabajo actual.** `main` + merge de `dev` + limpieza de pnpm. Esta es la que hay que continuar. |

Estructura en `eva3_dev`:

```text
audi-f1-store/            Frontend React 19 + Vite 8 + Bootstrap (pruebas Karma/Jasmine)
backend/                  Backend monolítico Spring Boot 4.1.3 (Java 21, MySQL 8.4 + Flyway, JWT). Antes se llamaba audi-f1-api/
```

---

## 3. Reglas de trabajo (importantes)

1. **Commits siempre a nombre del usuario** (`BnjmnD04`), **sin `Co-Authored-By`** ni ninguna atribución a herramientas de IA. Verificar tras cada commit: `git log -1 --format=%B`.
2. **Solo npm** en el repo (`package-lock.json`). No subir `pnpm-lock.yaml`, `pnpm-workspace.yaml` ni referencias a pnpm. Cada persona puede usar su gestor en local mientras esos archivos no se suban.
3. **No subir archivos personales**: rúbrica y anexos (`EVA3/`), resúmenes de clases (`gemini-code-*.md`), la guía personal, `proyectos_clases/` ni `evaluaci_n_parcial_2_dsy1104.md`. Se excluyen con `.git/info/exclude` (ver sección 4).
4. Commits separados por tema, con mensajes claros (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `build:`). La rúbrica evalúa el uso de GitHub y el profesor pregunta por los cambios.
5. Comentarios del código: solo técnicos y orientados a otros desarrolladores. Sin referencias a evaluaciones, rúbricas ni "requisitos".
6. Nunca hacer `push --force` a `main` sin avisar al colega.

---

## 4. Preparar otro equipo

### Herramientas

| Herramienta | Versión | Para qué |
|---|---|---|
| Git | cualquiera reciente | Control de versiones |
| Node.js | **24** (`.node-version`) | Frontend. Con fnm: `fnm use` |
| JDK | **21** (LTS; Spring Boot 4.1 exige 17 o superior) | Backend |
| Docker Desktop | reciente, con WSL2 en Windows | MySQL 8.4 |
| VS Code + Extension Pack for Java | — | IDE del backend |
| VS Code + Spring Boot Extension Pack (`vmware.vscode-boot-dev-pack`) | — | Panel de proyectos Spring |

Maven no hace falta instalarlo: cada proyecto trae `mvnw`. En Windows se usa `mvnw.cmd`. El wrapper está en `backend/`.

### Clonar y arrancar el frontend

```bash
git clone https://github.com/McRodriFly/Fullstack-02.git
cd Fullstack-02
git checkout eva3_dev
cd audi-f1-store
npm ci
npm run dev        # http://localhost:5173
npm test           # Karma + Jasmine en Chrome Headless (requiere Chrome instalado)
```

### Archivos que NO están en el repo

Hay que copiarlos a mano desde el equipo original si se necesitan. Están en la raíz y excluidos de Git:

- `EVA3/`: rúbrica (`DSY1104 Evaluación Parcial 3_EE_EP_Estudiante.pdf`) y los anexos 1 a 4. El resumen de la rúbrica está en la sección 5.
- `evaluaci_n_parcial_2_dsy1104.md`, `gemini-code-*.md`, `proyectos_clases/`, `GUIA_DEL_PROYECTO.md`: material personal de la EP2.

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

### SSH (solo si se usa el alias del equipo original)

En el equipo original el remoto es `git@github.com-duoc:McRodriFly/Fullstack-02.git`, un alias definido en `~/.ssh/config`. En otro equipo se puede usar la URL HTTPS de arriba o configurar su propia llave SSH.

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

IE3.1.2 (12 %), IE3.2.3 (12 %), IE3.2.4 (10 %), IE3.3.4 (10 %), IE3.3.5 (8 %), IE3.3.6 (8 %). Son los mismos temas, explicados en voz alta. Formato: 15 minutos de demo más 5 de preguntas, con el sistema funcionando integrado.

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

Leyenda: 🔴 no cumple · 🟠 parcial.

| Indicador | Estado | Hallazgos |
|---|---|---|
| IE3.1.1 Backend + BD | 🔴 | *(Estado inicial en `dev`; la compilación y el `pom.xml` ya se corrigieron y la conexión MySQL está configurada, pero faltan las migraciones.)* El monolito (`backend/`, antes `audi-f1-api`) no compilaba: `JwtUtils` usaba jjwt sin declararla en el `pom.xml`. La BD era H2, no MySQL. Solo 2 de las 5 tablas del modelo (`Producto`, `Usuario`). No hay capa de servicios: los controladores usan los repositorios directamente. |
| IE3.2.1 API REST + Swagger | 🟠 | Rutas `/api/v1` y CRUD de productos. Falta CRUD de usuarios (sin PUT ni GET por id), de boletas y de categorías. El monolito no tiene springdoc; solo los microservicios de productos lo declaran. |
| IE3.2.2 Integración | 🔴 | `audi-f1-store/src/services/api.js` tiene 3 funciones. Solo `Home` pide productos al backend (con respaldo en localStorage) y `Login` usa la API. Admin, categorías, ofertas, detalle, registro y checkout siguen contra localStorage (`src/data/*.js`). |
| IE3.3.1 JWT + roles | 🔴 | No hay filtro JWT. `SecurityConfig` deja `/api/v1/productos/**` y `/api/v1/usuarios/**` en `permitAll`. La clave JWT se regenera en cada arranque. Contraseñas en texto plano y `GET /usuarios` las expone. No hay renovación de token. |
| IE3.3.2 Sesión en el frontend | 🟠 | Guarda `tokenJWT` y `usuarioLogueado` en localStorage (persiste al recargar). No envía `Authorization: Bearer`, no valida expiración, no hay logout visible ni contexto de sesión. |
| IE3.3.3 Restricciones en el frontend | 🔴 | `/admin` no tiene guardia: se entra escribiendo la URL. El Vendedor ve lo mismo que el Administrador. |
| Presentación | 🟠 | El guion existente es de la EP2. Falta guion EP3. |

Otros hallazgos:

- **Frontend de `dev` sin el trabajo de la EP2.** Está basado en `d73b6d7` (sin ErrorBoundary, 404, ni las 94 pruebas) y conserva comentarios antiguos como "Migrado de…".
- **Documentos EP3 del repo** (`audi-f1-store/docs/Informe_Avance_EP3.pdf`, `Manual_de_Usuario_Audi_F1_EP3.pdf`, `Guion_Presentacion_Audi_F1.pdf`): los tres dan error de lectura ("PDF file is damaged"). El informe describe microservicios y H2, así que quedará obsoleto.
- **Versiones inconsistentes:** monolito en Spring Boot 4.1.2; microservicios en 3.2.5 (Spring Cloud 2023.0.1); el README dice "Spring Boot 3".
- **Pruebas del backend:** solo `contextLoads`.
- `docs/coverage.rar` (informe del colega) quedó en `audi-f1-store/docs/`.
- Los microservicios ya fueron retirados de esta rama; las referencias a ellos en este documento describen el estado de `dev`.

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

En `backup` el frontend está en la raíz (`src/`, `package.json`), mientras que en `eva3_dev` está en `audi-f1-store/`. Si se decide traer ese trabajo, los archivos hay que moverlos a `audi-f1-store/` (no sirve un merge directo; usar `git checkout backup -- <ruta>` por partes o `cherry-pick` con resolución de renombres). Umbral de cobertura configurado: 90 % en `karma.config.cjs`.

---

## 8. Decisiones

Tomadas (2026-11-23):

1. **Microservicios:** quitados de `eva3_dev` (siguen en `dev`). Hecho.
2. **Frontend de `backup`:** todavía no se trae; se usa como referencia y se integrará cuando se llegue a la Fase 4.
3. **Módulos del monolito:** primero se presenta el scaffolding (estructura de paquetes y reglas) y se aprueba antes de escribir código de backend.
4. **Esquema de BD:** **Flyway** (migraciones versionadas).

Pendiente:

5. **Rama de entrega:** definir cuándo y cómo se integra `eva3_dev` en `main` con el colega.
6. **Versión de Spring Boot:** el monolito usa 4.1.2; verificar compatibilidad de springdoc y jjwt antes de fijarla (alternativa: 3.5.x).

---

## 9. Plan por fases

### Fase 0: preparación
1. Instalar Docker Desktop (WSL2).
2. ~~Resolver las decisiones de la sección 8~~ (tomadas, ver arriba).

### Fase 1: infraestructura
3. `docker-compose.yml` con `mysql:8.4`, volumen persistente y variables en `.env` (ya ignorado por git). Incluir un `.env.example` sin secretos.
4. Driver MySQL y perfiles `dev` y `test` (H2 solo en pruebas) en `application.yml`.
5. Corregir el `pom.xml`: jjwt, springdoc, validación, versiones coherentes.

### Fase 2: monolito modular
6. Un solo despliegue en `backend`, con módulos por dominio y capas `api`, `domain`, `service`, `repository`:
   - `usuarios` (auth incluida),
   - `catalogo` (productos y categorías),
   - `ventas` (boletas y detalle de boleta),
   - `shared`/`config` (seguridad, errores, CORS, Swagger).
7. Los módulos se comunican por interfaces de servicio, no por repositorios ajenos.
8. Modelo según la Figura 1 y migraciones (`V1__esquema.sql`, `V2__datos_semilla.sql`) en lugar de `DataInitializer`.
9. DTOs, `@Valid` y `@RestControllerAdvice` para errores.

### Fase 3: seguridad
10. Spring Security con filtro JWT (clave desde variable de entorno), BCrypt, roles `ROLE_ADMIN` / `ROLE_VENDEDOR` / `ROLE_CLIENTE`, `@PreAuthorize` y refresh de token.
11. Matriz de permisos del Anexo 1: Vendedor solo lectura de productos y órdenes; Cliente solo tienda.

### Fase 4: integración con el frontend
12. Cliente HTTP único con `Authorization: Bearer`, manejo de 401/403 y `VITE_API_URL`.
13. `AuthContext`, rutas protegidas por rol, menús según rol y cierre de sesión.
14. Migrar productos, categorías, ofertas, registro, checkout (crea la boleta) y panel admin a la API; eliminar la dependencia de localStorage.

### Fase 5: calidad
15. Backend: servicios con Mockito, controladores con MockMvc, seguridad por rol y test de límites entre módulos.
16. Frontend: pruebas de sesión y guardias.

### Fase 6: documentación y presentación
17. Regenerar ERS, manual de usuario con pantallazos (Anexo 4), documentación de APIs (Anexo 3), documento de integración (Anexo 2), guion EP3 y README.

---

## 10. Referencia técnica

### Puertos

| Servicio | Puerto |
|---|---|
| Frontend (Vite) | 5173 |
| Backend monolito (propuesto) | 8080 |
| MySQL (propuesto) | 3306 |
| Eureka (microservicios) | 8761 |
| service-productos / service-usuarios | 8081 / 8082 |

### Usuarios semilla actuales (solo desarrollo)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@duoc.cl` | `1234` |
| Vendedor | `vendedor@duoc.cl` | `1234` |
| Cliente | `cliente@gmail.com` | `1234` |

Al migrar a BCrypt hay que volver a generar estos hashes.

### Endpoints actuales del monolito (`/api/v1`)

| Método | Ruta | Estado |
|---|---|---|
| GET | `/productos`, `/productos/{id}`, `/productos/ofertas` | Funciona (públicos) |
| POST / PUT / DELETE | `/productos[/{id}]` | Funciona **sin autenticación** |
| GET | `/usuarios` | Expone contraseñas |
| POST | `/usuarios/login` | Devuelve `{token, correo, nombre, rol}` |
| POST | `/usuarios/registro` | Acepta `rol` desde el cliente |
| DELETE | `/usuarios/{id}` | Sin autenticación |

### Comandos útiles

```bash
# Frontend
cd audi-f1-store && npm ci && npm run dev
npm test               # pruebas + cobertura
npm run lint           # oxlint
npm run build

# Backend (Windows: mvnw.cmd en vez de ./mvnw)
cd backend && ./mvnw spring-boot:run
./mvnw test

# MySQL (cuando exista el compose)
docker compose up -d
docker compose logs -f mysql
```

### Dónde está cada cosa en el frontend

- `src/services/api.js`: llamadas HTTP al backend (hoy 3 funciones).
- `src/data/productos.js`, `src/data/usuarios.js`: "base de datos" simulada en localStorage (a reemplazar por la API).
- `src/context/CarritoContext.jsx`: estado global del carrito.
- `src/pages/Login.jsx`: guarda `tokenJWT` y `usuarioLogueado`.
- `src/pages/admin/*`: panel de administración (sin guardia de acceso).
- `src/tests/`: pruebas Jasmine (en `eva3_dev` solo las 4 originales; las 94 están en `backup`).
