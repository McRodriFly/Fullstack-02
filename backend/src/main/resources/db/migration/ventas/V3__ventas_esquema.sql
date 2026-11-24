-- Módulo ventas: boletas y su detalle.
-- Las claves foráneas hacia usuarios y productos exigen que V1 y V2 se ejecuten antes.

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
