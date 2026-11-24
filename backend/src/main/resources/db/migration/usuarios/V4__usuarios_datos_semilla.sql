-- Usuarios iniciales de desarrollo, uno por rol. La contraseña de los tres es "1234",
-- guardada como hash BCrypt (costo 10). No usar estas cuentas fuera de un entorno de pruebas.
INSERT INTO usuarios (nombre, correo, contrasena_hash, rol) VALUES
    ('Administrador', 'admin@duoc.cl',    '$2a$10$Ks05h3aZJWiiFeBQuWVtXeUjBRyYHY8ng5WDLluAzBOi6Bm1Lsyoi', 'ROLE_ADMIN'),
    ('Vendedor',      'vendedor@duoc.cl', '$2a$10$ZQVSviGe6Wv42u9ole5Awe0lB4NhlHIjaIrifsRFoCrzXOKk.9Jgm', 'ROLE_VENDEDOR'),
    ('Cliente',       'cliente@gmail.com', '$2a$10$APY0PkoZYG0KZRZSdfJcoO4AchX1orOk4.oqbRnlVLm89dWNrkoEa', 'ROLE_CLIENTE');
