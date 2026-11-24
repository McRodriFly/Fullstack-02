-- Catálogo inicial de la tienda: las mismas categorías y productos que muestra el frontend.
INSERT INTO categorias (nombre) VALUES
    ('Chaquetas'),
    ('Ropa'),
    ('Gorras'),
    ('Accesorios'),
    ('Poleras');

-- precio_oferta NULL = sin oferta.
INSERT INTO productos (nombre, categoria_id, precio, precio_oferta, imagen, stock)
SELECT p.nombre, c.id, p.precio, p.precio_oferta, p.imagen, p.stock
FROM (
    SELECT 'Chaqueta Oficial F1'     AS nombre, 'Chaquetas'  AS categoria, 120000 AS precio, NULL  AS precio_oferta, 'Chaqueta_1.jpeg'      AS imagen, 10 AS stock UNION ALL
    SELECT 'Conjunto Deportivo F1',            'Ropa',                      85000,              69000,               'Conjunto_1.jpeg',               15 UNION ALL
    SELECT 'Gorra Negra Audi F1',              'Gorras',                    35000,              NULL,                'Gorra1.jpeg',                   25 UNION ALL
    SELECT 'Gorra Edición Especial',           'Gorras',                    40000,              32000,               'Gorra2.jpeg',                    8 UNION ALL
    SELECT 'Gorra Clásica Audi F1',            'Gorras',                    35000,              NULL,                'Gorra3.jpeg',                   20 UNION ALL
    SELECT 'Llavero Metálico F1',              'Accesorios',                15000,              NULL,                'Llavero_1.jpeg',                50 UNION ALL
    SELECT 'Polera Tipo 1 - A',                'Poleras',                   45000,              NULL,                'Polera_Tipo1_1.jpeg',           12 UNION ALL
    SELECT 'Polera Tipo 1 - B',                'Poleras',                   45000,              36000,               'Polera_Tipo1_2.jpeg',           12 UNION ALL
    SELECT 'Polera Tipo 1 - C',                'Poleras',                   45000,              NULL,                'Polera_Tipo1_3.jpeg',            5 UNION ALL
    SELECT 'Polera Tipo 2 - A',                'Poleras',                   50000,              NULL,                'Polera_Tipo2_1.jpeg',           10 UNION ALL
    SELECT 'Polera Tipo 2 - B',                'Poleras',                   50000,              40000,               'Polera_Tipo2_2.jpeg',           10 UNION ALL
    SELECT 'Polera Tipo 2 - C',                'Poleras',                   50000,              NULL,                'Polera_Tipo2_3.jpeg',            7
) AS p
JOIN categorias c ON c.nombre = p.categoria;
