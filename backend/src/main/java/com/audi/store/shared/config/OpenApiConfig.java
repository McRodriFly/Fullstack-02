package com.audi.store.shared.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Metadatos de la documentación OpenAPI y el esquema de autenticación Bearer (JWT). */
@Configuration
public class OpenApiConfig {

    /** Nombre del esquema; los controladores lo referencian con {@code @SecurityRequirement}. */
    public static final String ESQUEMA_JWT = "bearerAuth";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Audi F1 Store API")
                        .version("v1")
                        .description("API REST de la tienda: catálogo, usuarios y boletas."))
                .components(new Components().addSecuritySchemes(ESQUEMA_JWT,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
