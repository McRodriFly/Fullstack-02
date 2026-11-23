# 🏎️ Audi F1 Store — Fullstack II (DSY1104)

Proyecto semestral para la asignatura **Desarrollo Fullstack II**. Contiene la tienda oficial de merchandising del equipo **Audi Formula 1**, estructurada con frontend en React y backend en Spring Boot (monolito modular).

---

## 📁 Estructura del Repositorio

```text
Fullstack-02/
├── audi-f1-store/            # Frontend en React 19 (Vite, Bootstrap, Testing Jasmine/Karma)
└── backend/                  # Backend monolítico modular REST (Spring Boot, MySQL, JWT, Swagger)
```

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
   cd audi-f1-store && npm run dev
   ```

---

## 🧪 Pruebas Unitarias (Frontend)

Para correr la suite de pruebas unitarias en navegador real (Jasmine + Karma + Chrome Headless):

```bash
cd audi-f1-store && npm test
```

Resultado esperado: **94 SUCCESS / 100% de cobertura**.

---

## 🔑 Credenciales de Prueba

- **Administrador:** `admin@duoc.cl` / `1234` (Acceso a panel `/admin`)
- **Vendedor:** `vendedor@duoc.cl` / `1234`
- **Cliente:** `cliente@gmail.com` / `1234`
