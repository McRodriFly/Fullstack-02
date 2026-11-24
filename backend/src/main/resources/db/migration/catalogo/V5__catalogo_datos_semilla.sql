-- Catálogo inicial de la tienda: las mismas categorías y productos que muestra el frontend.
-- Los ids son explícitos para que coincidan con los del frontend (rutas /producto/:id y carrito).
-- AUTO_INCREMENT continúa después del mayor id insertado.
INSERT INTO categorias (id, nombre) VALUES
    (1, 'Chaquetas'),
    (2, 'Ropa'),
    (3, 'Gorras'),
    (4, 'Accesorios'),
    (5, 'Poleras');

-- precio_oferta NULL = sin oferta.
INSERT INTO productos (id, nombre, categoria_id, precio, precio_oferta, imagen, stock) VALUES
    ( 1, 'Chaqueta Oficial F1',    1, 120000, NULL,  'Chaqueta_1.jpeg',     10),
    ( 2, 'Conjunto Deportivo F1',  2,  85000, 69000, 'Conjunto_1.jpeg',     15),
    ( 3, 'Gorra Negra Audi F1',    3,  35000, NULL,  'Gorra1.jpeg',         25),
    ( 4, 'Gorra Edición Especial', 3,  40000, 32000, 'Gorra2.jpeg',          8),
    ( 5, 'Gorra Clásica Audi F1',  3,  35000, NULL,  'Gorra3.jpeg',         20),
    ( 6, 'Llavero Metálico F1',    4,  15000, NULL,  'Llavero_1.jpeg',      50),
    ( 7, 'Polera Tipo 1 - A',      5,  45000, NULL,  'Polera_Tipo1_1.jpeg', 12),
    ( 8, 'Polera Tipo 1 - B',      5,  45000, 36000, 'Polera_Tipo1_2.jpeg', 12),
    ( 9, 'Polera Tipo 1 - C',      5,  45000, NULL,  'Polera_Tipo1_3.jpeg',  5),
    (10, 'Polera Tipo 2 - A',      5,  50000, NULL,  'Polera_Tipo2_1.jpeg', 10),
    (11, 'Polera Tipo 2 - B',      5,  50000, 40000, 'Polera_Tipo2_2.jpeg', 10),
    (12, 'Polera Tipo 2 - C',      5,  50000, NULL,  'Polera_Tipo2_3.jpeg',  7);
