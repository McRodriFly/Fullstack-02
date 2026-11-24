-- Módulo catalogo: categorías y productos.

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
