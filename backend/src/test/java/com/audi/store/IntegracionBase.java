package com.audi.store;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.mysql.MySQLContainer;

/**
 * Base de las pruebas de integración: levanta la aplicación completa contra un MySQL 8.4 real en
 * Docker, con las migraciones Flyway aplicadas desde cero.
 *
 * <p>El contenedor es único para toda la ejecución de pruebas (se arranca una vez y lo apaga
 * Testcontainers al terminar) y es independiente de la base de desarrollo del
 * {@code docker-compose.yml}. Como se comparte, cada prueba debe dejar los datos como los encontró.
 */
@SpringBootTest
@AutoConfigureMockMvc
public abstract class IntegracionBase {

    private static final MySQLContainer MYSQL = new MySQLContainer("mysql:8.4")
            .withDatabaseName("audi_f1_store_test");

    static {
        MYSQL.start();
    }

    // Sustituye la conexión de application.yml, que depende de variables del .env.
    @DynamicPropertySource
    static void conexion(DynamicPropertyRegistry registro) {
        registro.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registro.add("spring.datasource.username", MYSQL::getUsername);
        registro.add("spring.datasource.password", MYSQL::getPassword);
    }
}
