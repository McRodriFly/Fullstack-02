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

> **Estado:** el backend está en desarrollo. Compila y su estructura modular se verifica con un test, pero todavía no arranca (`spring-boot:run`) porque faltan las migraciones de la base de datos.

---

## 🚀 Cómo Iniciar el Proyecto

### Base de datos, backend y frontend

0. **Base de datos (MySQL 8.4 en Docker):** requiere Docker Desktop.
   ```bash
   cp .env.example .env        # editar las contraseñas
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

La suite ampliada (94 pruebas, 100 % de cobertura) está en la rama `backup` y se integrará a esta rama junto con la conexión al backend.

**Backend** (verifica los límites entre módulos; no necesita base de datos). En Windows, `JAVA_HOME` debe apuntar al JDK 21:

```bash
cd backend && ./mvnw -B clean -Dtest=ModularidadTest test
```

---

## 🔑 Credenciales de Prueba

Se crearán con los datos iniciales de la base de datos (aún no existen):

- **Administrador:** `admin@duoc.cl` / `1234` (acceso al panel `/admin`)
- **Vendedor:** `vendedor@duoc.cl` / `1234`
- **Cliente:** `cliente@gmail.com` / `1234`
