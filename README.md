# 🏎️ Audi F1 Store — Fullstack II (DSY1104)

Proyecto semestral para la asignatura **Desarrollo Fullstack II**. Contiene la tienda oficial de merchandising del equipo **Audi Formula 1**, estructurada con frontend en React y backend en Spring Boot (monolito modular).

---

## 📁 Estructura del Repositorio

```text
Fullstack-02/
├── frontend/                 # Frontend en React 19 (Vite, Bootstrap, Testing Jasmine/Karma)
└── backend/                  # Backend monolítico modular REST (Spring Boot, MySQL, JWT, Swagger)
```

La arquitectura del backend está descrita en [`backend/ARQUITECTURA.md`](backend/ARQUITECTURA.md). Para continuar el trabajo desde otro equipo, ver [`RETOMAR_EVA3.md`](RETOMAR_EVA3.md).

> **Estado:** el backend está completo (API REST con JWT, roles, Swagger y 143 pruebas). El frontend trae el catálogo y la tienda de la EP2 con datos simulados en `localStorage`; su conexión con el backend es la Fase 4 y aún no está hecha.

---

## 🚀 Cómo Iniciar el Proyecto

### Base de datos, backend y frontend

0. **Base de datos (MySQL 8.4 en Docker):** requiere Docker Desktop.
   ```bash
   cp .env.example .env        # editar las contraseñas y generar JWT_SECRET (ver .env.example)
   docker compose up -d
   ```

1. **Backend:**
   ```bash
   cd backend && ./mvnw spring-boot:run
   ```
   *(Swagger UI: http://localhost:8080/swagger-ui.html)*

2. **Frontend React:**
   ```bash
   cd frontend && npm run dev
   ```

---

## 🧪 Pruebas

**Frontend** (Jasmine + Karma + Chrome Headless):

```bash
cd frontend && npm ci && npm test
```

Resultado esperado: `TOTAL: 94 SUCCESS`, con 100 % de cobertura. Requiere Node.js 26 y Google Chrome.

**Backend** (JUnit, Mockito, MockMvc y Testcontainers; requiere Docker en ejecución). En Windows, `JAVA_HOME` debe apuntar al JDK 21:

```bash
cd backend && ./mvnw -B clean test
```

Sin Docker se pueden correr solo las pruebas que no usan base de datos:
`./mvnw -B clean test -Dtest="*ServiceTest,*ControllerTest,CuponTest,ModularidadTest"`.

---

## 🔑 Credenciales de Prueba

Las crea la migración de datos iniciales al arrancar el backend (usables en Swagger UI con `POST /api/v1/auth/login`):

- **Administrador:** `admin@duoc.cl` / `1234` (acceso al panel `/admin`)
- **Vendedor:** `vendedor@duoc.cl` / `1234`
- **Cliente:** `cliente@gmail.com` / `1234`
