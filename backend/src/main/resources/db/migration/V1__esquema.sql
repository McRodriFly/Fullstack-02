-- Esquema inicial de la tienda.
--
-- Convenciones:
--   * Tablas y columnas en snake_case; claves primarias BIGINT autoincrementales.
--   * Montos en pesos chilenos: DECIMAL(12,0), sin decimales.
--   * Nombres de restricciones con prefijo: pk_, fk_, uq_, ck_, idx_. En MySQL los
--     nombres de CHECK son únicos por esquema, por eso llevan el nombre de la tabla.
--   * Los valores de rol y estado se guardan como texto con CHECK; en Java son enum
--     mapeados con @Enumerated(EnumType.STRING).

-- Cuentas de acceso. Un usuario tiene un solo rol.
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

CREATE TABLE categorias (
    id     BIGINT      NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(60) NOT NULL,
    CONSTRAINT pk_categorias PRIMARY KEY (id),
    CONSTRAINT uq_categorias_nombre UNIQUE (nombre)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE productos (
    id            BIGINT        NOT NULL AUTO_INCREMENT,
    nombre        VARCHAR(150)  NOT NULL,
    categoria_id  BIGINT        NOT NULL,
    precio        DECIMAL(12,0) NOT NULL,
    -- NULL significa "sin oferta"; el indicador de oferta se deriva de este campo.
    precio_oferta DECIMAL(12,0) NULL,
    -- Nombre del archivo de imagen (por ejemplo, Gorra1.jpeg).
    imagen        VARCHAR(255)  NOT NULL,
    stock         INT           NOT NULL DEFAULT 0,
    CONSTRAINT pk_productos PRIMARY KEY (id),
    -- RESTRICT: no se puede borrar una categoría que aún tiene productos.
    CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id)
        ON DELETE RESTRICT,
    CONSTRAINT ck_productos_precio CHECK (precio >= 0),
    CONSTRAINT ck_productos_precio_oferta CHECK (precio_oferta IS NULL OR precio_oferta < precio),
    -- Última defensa ante descuentos de stock concurrentes que se salten la validación del servicio.
    CONSTRAINT ck_productos_stock CHECK (stock >= 0),
    INDEX idx_productos_categoria (categoria_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Cabecera de la compra. El cliente debe tener sesión iniciada, por eso usuario_id es obligatorio.
CREATE TABLE boletas (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    usuario_id      BIGINT        NOT NULL,
    fecha           DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    estado          VARCHAR(20)   NOT NULL DEFAULT 'PAGADA',
    subtotal        DECIMAL(12,0) NOT NULL,
    -- Monto descontado (no el porcentaje): la boleta no cambia si cambian los cupones.
    descuento       DECIMAL(12,0) NOT NULL DEFAULT 0,
    total           DECIMAL(12,0) NOT NULL,
    cupon_codigo    VARCHAR(30)   NULL,
    tipo_entrega    VARCHAR(10)   NOT NULL,
    direccion_envio VARCHAR(200)  NULL,
    ciudad          VARCHAR(80)   NULL,
    CONSTRAINT pk_boletas PRIMARY KEY (id),
    -- RESTRICT: un usuario con compras no se puede borrar.
    CONSTRAINT fk_boletas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON DELETE RESTRICT,
    CONSTRAINT ck_boletas_estado CHECK (estado IN ('PAGADA', 'ANULADA')),
    CONSTRAINT ck_boletas_subtotal CHECK (subtotal >= 0),
    CONSTRAINT ck_boletas_descuento CHECK (descuento >= 0),
    CONSTRAINT ck_boletas_total CHECK (total = subtotal - descuento),
    CONSTRAINT ck_boletas_tipo_entrega CHECK (tipo_entrega IN ('DESPACHO', 'RETIRO')),
    -- El despacho exige dirección y ciudad; el retiro en tienda no.
    CONSTRAINT ck_boletas_direccion CHECK (
        tipo_entrega = 'RETIRO' OR (direccion_envio IS NOT NULL AND ciudad IS NOT NULL)
    ),
    -- Sirve a "mis boletas" (usuario + fecha) y cubre la clave foránea.
    INDEX idx_boletas_usuario_fecha (usuario_id, fecha)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Líneas de la boleta. El subtotal de cada línea no se guarda: es cantidad * precio_unitario.
CREATE TABLE detalles_boleta (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    boleta_id       BIGINT        NOT NULL,
    producto_id     BIGINT        NOT NULL,
    cantidad        INT           NOT NULL,
    -- Precio vigente al momento de la compra; no cambia si el producto se reajusta después.
    precio_unitario DECIMAL(12,0) NOT NULL,
    CONSTRAINT pk_detalles_boleta PRIMARY KEY (id),
    -- CASCADE: el detalle es parte de la boleta y no existe sin ella.
    CONSTRAINT fk_detalles_boleta FOREIGN KEY (boleta_id) REFERENCES boletas (id)
        ON DELETE CASCADE,
    -- RESTRICT: un producto ya vendido no se puede borrar.
    CONSTRAINT fk_detalles_producto FOREIGN KEY (producto_id) REFERENCES productos (id)
        ON DELETE RESTRICT,
    CONSTRAINT ck_detalles_cantidad CHECK (cantidad > 0),
    CONSTRAINT ck_detalles_precio_unitario CHECK (precio_unitario >= 0),
    -- Una sola línea por producto en cada boleta; el servicio agrupa los repetidos del carrito.
    -- Este índice también cubre la clave foránea de boleta_id.
    CONSTRAINT uq_detalles_boleta_producto UNIQUE (boleta_id, producto_id),
    INDEX idx_detalles_producto (producto_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
