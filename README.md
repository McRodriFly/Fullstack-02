# 🏎️ Audi F1 Store — Fullstack II (DSY1104)

Proyecto semestral para la asignatura **Desarrollo Fullstack II**. Contiene la tienda oficial de merchandising del equipo **Audi Formula 1**, estructurada con frontend en React, backend en Spring Boot y arquitectura de microservicios con Spring Cloud.

---

## 📁 Estructura del Repositorio

```text
Fullstack-02/
├── audi-f1-store/            # Frontend en React 19 (Vite, Bootstrap, Testing Jasmine/Karma)
├── audi-f1-api/              # Backend Monolítico REST (Spring Boot 3, H2, JWT, Swagger)
└── audi-f1-microservices/    # Arquitectura de Microservicios (Spring Cloud)
    ├── eureka-server/        # Servidor de descubrimiento (Puerto 8761)
    ├── api-gateway/          # Enrutador único API Gateway (Puerto 8080)
    ├── service-productos/    # Microservicio de inventario y CRUD (Puerto 8081)
    └── service-usuarios/     # Microservicio de autenticación y JWT (Puerto 8082)
```

---

## 🚀 Cómo Iniciar el Proyecto

### Opción 1: Levantar con Arquitectura de Microservicios (Spring Cloud)

Abre terminales separadas y ejecuta en orden:

1. **Eureka Server:**
   ```bash
   cd audi-f1-microservices/eureka-server && ./mvnw spring-boot:run
   ```
   *(Panel Eureka: http://localhost:8761)*

2. **Microservicio de Productos:**
   ```bash
   cd audi-f1-microservices/service-productos && ./mvnw spring-boot:run
   ```

3. **Microservicio de Usuarios y JWT:**
   ```bash
   cd audi-f1-microservices/service-usuarios && ./mvnw spring-boot:run
   ```

4. **API Gateway:**
   ```bash
   cd audi-f1-microservices/api-gateway && ./mvnw spring-boot:run
   ```
   *(Rutas base: http://localhost:8080/api/v1/...)*

5. **Frontend React:**
   ```bash
   cd audi-f1-store && npm run dev
   ```
   *(Tienda web: http://localhost:5173)*

---

### Opción 2: Levantar con Backend Monolito REST

1. **Backend:**
   ```bash
   cd audi-f1-api && ./mvnw spring-boot:run
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
