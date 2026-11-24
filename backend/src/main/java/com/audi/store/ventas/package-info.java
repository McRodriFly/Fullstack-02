/**
 * Boletas y su detalle (checkout y consulta de órdenes).
 */
@ApplicationModule(displayName = "Ventas", allowedDependencies = {"shared", "catalogo :: api", "usuarios :: api"})
package com.audi.store.ventas;

import org.springframework.modulith.ApplicationModule;
