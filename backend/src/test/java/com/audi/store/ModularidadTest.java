package com.audi.store;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

/** Falla si un módulo usa clases internas de otro o si hay dependencias circulares. */
class ModularidadTest {

    private static final ApplicationModules MODULOS = ApplicationModules.of(AudiF1ApiApplication.class);

    @Test
    void respetaLosLimitesEntreModulos() {
        MODULOS.verify();
    }
}
