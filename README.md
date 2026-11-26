# Audi F1 Store

Tienda en línea de merchandising del equipo Audi Formula 1. Aplicación web de tres capas: frontend en React, API REST en Spring Boot y base de datos MySQL, con autenticación JWT y control de acceso por rol.

Proyecto de la asignatura Desarrollo Fullstack II (DSY1104).

## Tabla de contenidos

- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Puesta en marcha](#puesta-en-marcha)
- [Roles y credenciales de desarrollo](#roles-y-credenciales-de-desarrollo)
- [Pruebas](#pruebas)
- [Documentación](#documentación)
- [Estructura del repositorio](#estructura-del-repositorio)

## Arquitectura

```text
React (SPA)  --HTTP/JSON + JWT-->  Spring Boot (API REST /api/v1)  --JDBC-->  MySQL 8.4
```

- **Frontend:** SPA con React que consume la API mediante `fetch`. Guarda la sesión en `localStorage`, renueva el token de acceso de forma automática y restringe las rutas según el rol del usuario.
- **Backend:** monolito modular con tres módulos (`usuarios`, `catalogo` y `ventas`), cada uno con sus capas de controlador, servicio y repositorio. La verificación de fronteras entre módulos es automática (Spring Modulith). El esquema de base de datos se versiona con Flyway, una carpeta de migraciones por módulo.
- **Seguridad:** Spring Security con JWT de acceso (15 minutos) y de refresco (7 días), contraseñas con BCrypt y permisos por rol en cada endpoint.
- **Documentación de la API:** especificación OpenAPI 3.1 generada con springdoc, disponible en Swagger UI.

El detalle de las decisiones de diseño del backend está en [`backend/ARQUITECTURA.md`](backend/ARQUITECTURA.md).

## Tecnologías

| Capa | Tecnologías |
|---|---|
| Frontend | React 19, Vite, React Router, Bootstrap 5 |
| Backend | Java 21, Spring Boot 4.1, Spring Security, Spring Data JPA, Spring Modulith, Flyway, springdoc-openapi |
| Base de datos | MySQL 8.4 (Docker Compose) |
| Pruebas frontend | Jasmine, Karma, React Testing Library, Istanbul |
| Pruebas backend | JUnit 5, Mockito, MockMvc, Testcontainers |

## Requisitos

- Node.js 26 (ver `frontend/.node-version`) y Google Chrome, para las pruebas del frontend.
- JDK 21. En Windows, `JAVA_HOME` debe apuntar a esa instalación.
- Docker, para la base de datos y para las pruebas de integración del backend.

## Puesta en marcha

1. **Base de datos**

   ```bash
   cp .env.example .env     # definir las contraseñas y generar JWT_SECRET (ver comentarios del archivo)
   docker compose up -d
   ```

2. **Backend** (http://localhost:8080)

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

   Al arrancar, Flyway crea el esquema y carga los datos iniciales. Swagger UI queda en http://localhost:8080/swagger-ui.html y la especificación en `/v3/api-docs`.

3. **Frontend** (http://localhost:5173)

   ```bash
   cd frontend
   npm ci
   npm run dev
   ```

   La URL de la API es `http://localhost:8080/api/v1`; se cambia con la variable `VITE_API_URL` en un archivo `.env` del frontend.

## Roles y credenciales de desarrollo

| Rol | Acceso |
|---|---|
| Administrador | Acceso total: dashboard con indicadores y gráficos, productos, categorías, órdenes y usuarios. |
| Vendedor | Consulta de productos y de órdenes, en modo lectura. |
| Cliente | Tienda: catálogo, carrito, compra e historial de compras (Mis compras). |

Usuarios cargados por la migración de datos iniciales, para entornos de desarrollo. Se pueden usar en Swagger UI con `POST /api/v1/auth/login`.

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@duoc.cl` | `1234` |
| Vendedor | `vendedor@duoc.cl` | `1234` |
| Cliente | `cliente@gmail.com` | `1234` |

Estas credenciales no deben usarse fuera de un entorno local.

## Pruebas

**Frontend** (Jasmine, Karma y Chrome Headless):

```bash
cd frontend
npm ci
npm test
```

La ejecución espera `TOTAL: 233 SUCCESS` y falla si la cobertura global baja del 90 % o si la de un archivo crítico (sesión, cliente HTTP, contextos, guardia de rutas, validaciones y roles) baja del 100 %.

**Backend** (JUnit, Mockito, MockMvc y Testcontainers; requiere Docker en ejecución):

```bash
cd backend
./mvnw -B clean test
```

Son 148 pruebas, incluida una que verifica que la especificación OpenAPI documente todos los endpoints. Sin Docker se pueden ejecutar solo las que no usan base de datos:

```bash
./mvnw -B clean test -Dtest="*ServiceTest,*ControllerTest,CuponTest,ModularidadTest"
```

## Documentación

En [`docs/`](docs/):

- Especificación de requisitos del software (ERS), versión 3.0.
- Documentación de APIs e integración (Anexo 2), con el modelo de datos.
- Planilla de endpoints (Anexo 3).
- Manual de usuario con capturas de pantalla (Anexo 4).
- Evidencia de OpenAPI, con capturas de Swagger UI, y la especificación exportada ([`docs/openapi.json`](docs/openapi.json)).
- Informe de pruebas con Jasmine y Karma.
- Guion de la presentación.

## Estructura del repositorio

```text
.
├── backend/     API REST (Spring Boot, MySQL, JWT, OpenAPI)
├── frontend/    Aplicación web (React, Vite, pruebas Jasmine/Karma)
├── docs/        Documentación y capturas de pantalla
└── docker-compose.yml   Base de datos MySQL para desarrollo
```
