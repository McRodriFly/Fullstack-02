-- Módulo usuarios: cuentas de acceso.
--
-- Convenciones de todo el esquema:
--   * Tablas y columnas en snake_case; claves primarias BIGINT autoincrementales.
--   * Montos en pesos chilenos: DECIMAL(12,0), sin decimales.
--   * Nombres de restricciones con prefijo: pk_, fk_, uq_, ck_, idx_. En MySQL los
--     nombres de CHECK son únicos por esquema, por eso llevan el nombre de la tabla.
--   * Los valores de rol y estado se guardan como texto con CHECK; en Java son enum
--     mapeados con @Enumerated(EnumType.STRING).
--   * Las migraciones se separan en carpetas por módulo, pero Flyway las ejecuta en
--     orden de versión: la numeración respeta las claves foráneas entre módulos.

-- Un usuario tiene un solo rol.
CREATE TABLE usuarios (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    nombre          VARCHAR(100) NOT NULL,
    -- La colación del esquema no distingue mayúsculas: "A@x.cl" y "a@x.cl" chocan.
    correo          VARCHAR(150) NOT NULL,
    -- Hash BCrypt (60 caracteres); la contraseña en claro nunca se almacena.
    contrasena_hash VARCHAR(100) NOT NULL,
    rol             VARCHAR(20)  NOT NULL,
    creado_en       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_usuarios PRIMARY KEY (id),
    CONSTRAINT uq_usuarios_correo UNIQUE (correo),
    CONSTRAINT ck_usuarios_rol CHECK (rol IN ('ROLE_ADMIN', 'ROLE_VENDEDOR', 'ROLE_CLIENTE'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
