# Guion de presentación — Audi F1 Store (EP3)

Formato: **15 minutos de demostración + 5 de preguntas**, con el sistema funcionando integrado. Cada integrante responde sobre los cambios que hizo en GitHub.

## Antes de empezar (5 minutos antes)

1. Docker Desktop abierto y la base lista. Para partir con los datos iniciales: `docker compose down -v` y luego `docker compose up -d`.
2. Backend: `cd backend && ./mvnw spring-boot:run` (en Windows, `JAVA_HOME` apuntando al JDK 21). Esperar el mensaje `Started AudiF1ApiApplication`.
3. Frontend: `cd frontend && npm run dev` → http://localhost:5173.
4. Abrir en pestañas: la tienda, Swagger (http://localhost:8080/swagger-ui.html) y el repositorio de GitHub (commits).
5. Dejar sin sesión iniciada (si hace falta: DevTools → Application → Local Storage → borrar).

Cuentas (contraseña `1234`): `admin@duoc.cl`, `vendedor@duoc.cl`, `cliente@gmail.com`. Cupones: `F1AUDI` (10 %) y `NEUBURG2026` (15 %). Tarjeta rechazada: `4000000000000002`.

## Recorrido de la demostración (15 min)

| Min | Qué mostrar | Qué decir | Indicador |
|---|---|---|---|
| 0–1 | Arquitectura en una frase | React → API REST Spring Boot → MySQL. Monolito modular: `usuarios`, `catalogo` y `ventas`, con capas controlador–servicio–repositorio. | IE3.1.1 |
| 1–3 | Swagger: abrir la lista de endpoints y ejecutar `GET /productos` | 22 endpoints bajo `/api/v1`, documentados. Las rutas privadas piden el token (botón *Authorize*). | IE3.2.1 |
| 3–5 | Tienda sin sesión: catálogo, detalle, ofertas y categorías | Los datos vienen de la API, no del navegador. Intentar `/admin` y `/checkout` lleva al login. | IE3.2.2, IE3.3.3 |
| 5–7 | Registro de un cliente y recarga de la página | La cuenta se crea como cliente y la sesión sobrevive a la recarga (tokens en el navegador). Mostrar Local Storage. | IE3.3.2 |
| 7–10 | Carrito con cupón → checkout → compra exitosa | El servidor calcula el total, descuenta el stock y devuelve el N° de pedido. Repetir con más unidades que el stock: 409. Tarjeta `4000000000000002`: rechazo sin tocar el backend. | IE3.2.2 |
| 10–13 | Administrador: resumen, crear/editar/eliminar un producto, usuarios (correo repetido y cuenta propia) y órdenes con detalle | CRUD completo contra la API. Un producto vendido no se elimina (409). | IE3.2.1, IE3.3.1 |
| 13–14 | Vendedor: solo productos (lectura) y órdenes; `/admin/usuarios` → Acceso denegado | Matriz de roles. El backend también la exige (`@PreAuthorize`), no solo el frontend. | IE3.3.1, IE3.3.3 |
| 14–15 | Pruebas y GitHub | 148 pruebas de backend y 192 de frontend en verde, con cobertura del 100 % en sesión, cliente HTTP y guardias. Commits por tema. | IE3.1.2 |

Plan B si el backend falla en vivo: la tienda muestra «No se pudo conectar con el servidor» (es un comportamiento esperado). Reiniciar el backend y recargar.

## Quién responde qué

| Tema | Responde | Dónde está en GitHub |
|---|---|---|
| Esquema de la base de datos, Flyway, entidades y servicios (stock, cupones, boletas) | Backend | `backend/src/main/resources/db/migration`, `ventas/internal/service` |
| JWT, BCrypt, filtro, roles y refresco | Backend | `backend/.../shared/security`, `usuarios/internal/service/AutenticacionService` |
| Cliente HTTP, sesión, `AuthContext` y refresco automático | Frontend | `frontend/src/services`, `frontend/src/context/AuthContext.jsx` |
| Rutas protegidas, panel por rol, catálogo y checkout contra la API | Frontend | `frontend/src/components/RutaProtegida.jsx`, `frontend/src/pages` |
| Pruebas | Ambos | `backend/src/test`, `frontend/src/tests` |

## Preguntas probables y respuestas cortas

- **¿Cómo funciona el JWT?** El login devuelve un token de acceso (15 min, con id, correo y rol) y uno de refresco (7 días). El filtro valida el de acceso en cada solicitud sin consultar la base. Al vencer, el frontend pide uno nuevo con el de refresco y repite la solicitud.
- **¿Por qué dos tokens?** El de acceso dura poco para limitar el daño si se filtra; el de refresco solo sirve en `/auth/refresh` y relee al usuario, así un cambio de rol se nota en minutos.
- **¿Cómo se guardan las contraseñas?** Con BCrypt; ninguna respuesta las incluye.
- **¿Cómo se protegen los permisos?** En el backend con `@PreAuthorize` en cada endpoint; en el frontend con `RutaProtegida`, que solo decide qué se muestra.
- **¿Qué pasa si dos clientes compran lo último que queda?** El stock se descuenta con bloqueo de fila (`SELECT … FOR UPDATE`) en orden de id y todo ocurre en una transacción: uno compra y el otro recibe 409. Hay una prueba de integración que lo verifica.
- **¿Por qué el servidor calcula el total?** El frontend no envía precios: el servidor cobra el precio vigente del catálogo, para que nadie pueda alterarlo.
- **¿Cómo cambia el esquema de la base?** Solo con migraciones Flyway (una carpeta por módulo); Hibernate solo valida.
- **¿Qué es el monolito modular?** Un solo despliegue dividido por tema; Spring Modulith verifica en una prueba que un módulo solo use la `api` pública de otro.
- **¿Dónde se guarda la sesión en el navegador y es seguro?** En `localStorage`: es simple y persiste ante recargas, pero un script malicioso podría leerla; una cookie `httpOnly` sería más segura y exigiría cambiar el backend (CORS con credenciales y CSRF).
- **¿Qué falta o qué mejorarías?** Pasarela de pago real, página «Mis compras» para el cliente (el endpoint `GET /boletas/mias` ya existe), cookies `httpOnly` y revocación de tokens al cerrar sesión.
