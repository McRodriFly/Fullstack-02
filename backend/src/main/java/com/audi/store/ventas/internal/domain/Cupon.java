package com.audi.store.ventas.internal.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;

/**
 * Cupones de descuento vigentes. Son pocos y cambian rara vez, por eso viven en el código y no
 * en una tabla. La boleta guarda el código y el monto descontado, no una referencia a este enum.
 */
public enum Cupon {
    F1AUDI(10),
    NEUBURG2026(15);

    private final int porcentaje;

    Cupon(int porcentaje) {
        this.porcentaje = porcentaje;
    }

    public int getPorcentaje() {
        return porcentaje;
    }

    /** Busca un cupón ignorando espacios y mayúsculas, como lo hace el carrito del frontend. */
    public static Optional<Cupon> buscar(String codigo) {
        String limpio = codigo.trim().toUpperCase(Locale.ROOT);
        return Arrays.stream(values()).filter(c -> c.name().equals(limpio)).findFirst();
    }

    /**
     * Monto a descontar sobre {@code subtotal}, redondeado al peso con medio hacia arriba
     * (el mismo resultado que {@code Math.round} en el frontend para montos positivos).
     */
    public BigDecimal descuentoSobre(BigDecimal subtotal) {
        return subtotal.multiply(BigDecimal.valueOf(porcentaje))
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
    }
}
