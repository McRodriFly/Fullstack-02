# Arquitectura del backend

Backend de la tienda Audi F1: **monolito modular** con **arquitectura en capas** dentro de cada módulo. Un solo programa Spring Boot, dividido por tema (`usuarios`, `catalogo`, `ventas`), con MySQL 8.4 como base de datos.

## 1. Cómo se organiza

Tres niveles, de lo general a lo particular:

1. **Monolito modular.** Un solo despliegue, dividido en módulos por funcionalidad. Cada módulo tiene una puerta (`api/`) y todo lo demás es privado (`internal/`).
2. **Capas dentro de cada módulo.** Controlador → servicio → repositorio (CSR), con las entidades en `domain`.
3. **Verificación automática.** Spring Modulith comprueba en un test que ningún módulo use clases privadas de otro y que no haya dependencias circulares.

## 2. Estructura de paquetes

Paquete base: `com.audi.store`.

```text
com.audi.store/
├── AudiF1ApiApplication.java
├── shared/                          módulo abierto: lo usan todos, sin entidades de negocio
│   ├── config/     OpenApiConfig, CorsConfig
│   ├── security/   SecurityConfig, JwtService, JwtAuthFilter
│   └── error/      GlobalExceptionHandler, ApiError, RecursoNoEncontradoException
│
├── usuarios/                        cuentas, roles y autenticación
├── catalogo/                        productos y categorías
└── ventas/                          boletas y su detalle
```

Cada módulo (`usuarios`, `catalogo`, `ventas`) tiene la misma forma:

```text
catalogo/
├── package-info.java        declara el módulo y de quién puede depender
├── api/                     PÚBLICO: lo único que ven los otros módulos
│   ├── package-info.java    @NamedInterface("api")
│   ├── CatalogoApi.java     interfaz (fachada) con lo que el módulo ofrece
│   └── ProductoResumen.java datos que la fachada entrega
└── internal/                PRIVADO: nadie de otro módulo puede importarlo
    ├── web/                 controladores
    │   └── dto/             objetos de entrada y salida de la API REST
    ├── service/             lógica de negocio (incluye la implementación de la fachada)
    ├── repository/          acceso a datos (Spring Data JPA)
    └── domain/              entidades JPA
```

`ventas` no tiene `api/` por ahora: se crea cuando otro módulo necesite usarla.

Dependencias permitidas:

| Módulo | Puede usar |
|---|---|
| `usuarios` | `shared` |
| `catalogo` | `shared` |
| `ventas` | `shared`, `catalogo :: api`, `usuarios :: api` |

## 3. Flujo de una petición

Checkout de un cliente (`POST /api/v1/boletas`):

```text
React ── POST /api/v1/boletas ──▶ ventas/internal/web/BoletaController   valida el JSON
                                          ▼
                                  ventas/internal/service/BoletaService  aplica las reglas
                                          │
                                          ├──▶ CatalogoApi (puerta)  precio y descuento de stock
                                          ▼
                                  ventas/internal/repository/BoletaRepository ──▶ MySQL
```

`BoletaService` conoce a `catalogo` solo a través de `CatalogoApi`. Nunca usa su repositorio ni sus entidades.

## 4. Reglas

### Módulos
1. `usuarios` y `catalogo` no dependen de otros módulos de negocio.
2. `ventas` usa a los otros módulos solo mediante su `api/`.
3. `shared` no conoce entidades de negocio. El filtro JWT toma el rol desde el token, sin consultar la base de datos.
4. Todo código de un módulo fuera de `api/` va dentro de `internal/`.
5. Las dependencias circulares entre módulos están prohibidas.

### Capas
6. `web → service → repository → domain`. Un controlador nunca usa un repositorio.
7. Los controladores reciben y devuelven DTOs, nunca entidades.
8. La lógica de negocio y las transacciones (`@Transactional`) viven en `service`.
9. Inyección de dependencias por constructor, nunca `@Autowired` sobre campos.

### API REST
10. Todas las rutas bajo `/api/v1`, con CRUD completo por recurso.
11. Códigos HTTP: `201` al crear, `204` al eliminar, `400` datos inválidos, `401` sin sesión, `403` sin permiso, `404` no existe.
12. Validación con `@Valid` en los DTOs. Un único formato de error, producido por `GlobalExceptionHandler`.
13. Cada endpoint se documenta con `@Tag` y `@Operation` (Swagger UI en `/swagger-ui.html`).
14. Los DTOs son `record` de Java. El mapeo entidad ↔ DTO se hace con métodos estáticos (`ProductoResponse.desde(producto)`), sin librerías de mapeo.

### Entidades
15. En entidades JPA se usa `@Getter` y `@Setter` de Lombok, nunca `@Data`: el `equals`, `hashCode` y `toString` generados rompen las relaciones perezosas de Hibernate.

### Base de datos
16. El esquema cambia solo con migraciones Flyway (`src/main/resources/db/migration`), en una subcarpeta por módulo (`usuarios/`, `catalogo/`, `ventas/`). La numeración es única y global: Flyway ejecuta por versión sin importar la carpeta, así que una tabla con clave foránea hacia otro módulo lleva una versión posterior a la de ese módulo. Una migración ya aplicada no se edita: se crea una nueva.
17. Hibernate solo valida el esquema (`ddl-auto: validate`).
18. Tablas y columnas en `snake_case`. Montos en `DECIMAL(12,0)` (pesos chilenos). Todas las relaciones con clave foránea.
19. Cada detalle de boleta guarda el precio unitario del momento de la compra.

### Seguridad
20. Contraseñas con BCrypt. La clave JWT se lee de una variable de entorno y nunca del código.
21. Los permisos se declaran con `@PreAuthorize` en cada endpoint, según la matriz de la sección 5.
22. Ninguna respuesta incluye contraseñas ni hashes.

## 5. Permisos por rol

| Recurso | Acceso |
|---|---|
| `POST /auth/login`, `/auth/registro`, `/auth/refresh` | Público |
| `GET /productos`, `/productos/{id}`, `/categorias` | Público |
| `POST`, `PUT`, `DELETE` de productos y categorías | Administrador |
| `/usuarios` (CRUD) | Administrador |
| `GET /boletas`, `/boletas/{id}` | Administrador y Vendedor |
| `POST /boletas`, `GET /boletas/mias` | Cliente (sesión obligatoria) |

El Vendedor solo consulta productos y órdenes. El Cliente solo usa la tienda.

## 6. Base de datos

- MySQL 8.4 en Docker: `docker compose up -d` desde la raíz del repositorio.
- Credenciales en `.env` (copiar desde `.env.example`); el backend las lee desde ahí.
- Modelo: `usuarios` → `boletas` → `detalles_boleta` ← `productos` ← `categorias`.
- Entre módulos las tablas se relacionan con clave foránea en la base de datos, pero las entidades de `ventas` guardan solo el id (`usuarioId`, `productoId`), sin relación JPA hacia entidades de otro módulo.
- Migraciones actuales: `usuarios/V1` y `V4` (esquema y cuentas iniciales), `catalogo/V2` y `V5` (esquema y catálogo inicial), `ventas/V3` (esquema).
- Cuentas iniciales de desarrollo (contraseña `1234`): `admin@duoc.cl`, `vendedor@duoc.cl`, `cliente@gmail.com`.

## 7. Pruebas

- **Servicios:** Mockito, sin base de datos.
- **Controladores:** MockMvc, incluyendo el acceso por rol (200, 401 y 403).
- **Integración:** Testcontainers con `mysql:8.4` (requiere Docker en ejecución).
- **Arquitectura:** `ModularidadTest` ejecuta `ApplicationModules.verify()`. Si se rompe una regla de módulos, el test falla.

## 8. Comentarios y Javadoc

- **Javadoc** en:
  - las interfaces de `api/`, con `@throws` donde corresponda;
  - los métodos de servicio que aplican reglas de negocio (stock, totales, permisos);
  - los componentes de seguridad: cómo se emite, valida y renueva el token;
  - el manejador global de errores.
- **Sin Javadoc** en getters, `record` evidentes ni métodos de controlador (`@Operation` ya los documenta).
- **Comentarios de una línea** que expliquen el *porqué*, no lo que el código ya dice.
- Todo en español.

## 9. Convenciones

- Nombres del dominio en español (`Producto`, `BoletaService`); sufijos técnicos en inglés (`Controller`, `Service`, `Repository`).
- Commits pequeños por tema, con prefijo (`feat:`, `fix:`, `refactor:`, `build:`, `test:`, `docs:`).
- El código de un módulo nunca se importa desde otro, salvo `api/`.

## 10. Cómo agregar algo nuevo

**Un endpoint:**
1. DTOs en `internal/web/dto`.
2. Método en el `service` con su regla de negocio y su Javadoc.
3. Método en el controlador con `@Operation` y `@PreAuthorize`.
4. Pruebas del servicio y del controlador.

**Un módulo:**
1. Carpeta con `package-info.java`, `api/` e `internal/{web,service,repository,domain}`.
2. Declarar sus dependencias permitidas en el `package-info.java`.
3. Migración Flyway en `db/migration/<módulo>/` si agrega tablas, con la siguiente versión libre.
4. Ejecutar `ModularidadTest`.
