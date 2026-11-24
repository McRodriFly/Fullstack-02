/**
 * Infraestructura común: configuración, seguridad y manejo de errores.
 * Módulo abierto: lo usan todos los módulos y no contiene entidades de negocio.
 */
@ApplicationModule(displayName = "Shared", type = ApplicationModule.Type.OPEN)
package com.audi.store.shared;

import org.springframework.modulith.ApplicationModule;
