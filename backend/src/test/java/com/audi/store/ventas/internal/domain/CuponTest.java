package com.audi.store.ventas.internal.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class CuponTest {

    @Test
    void buscaIgnorandoEspaciosYMayusculas() {
        assertThat(Cupon.buscar("  f1audi ")).contains(Cupon.F1AUDI);
        assertThat(Cupon.buscar("Neuburg2026")).contains(Cupon.NEUBURG2026);
    }

    @Test
    void uncuponInexistenteNoSeEncuentra() {
        assertThat(Cupon.buscar("GRATIS")).isEmpty();
        assertThat(Cupon.buscar("")).isEmpty();
    }

    @Test
    void calculaElPorcentajeDelSubtotal() {
        assertThat(Cupon.F1AUDI.descuentoSobre(new BigDecimal("120000"))).isEqualByComparingTo("12000");
        assertThat(Cupon.NEUBURG2026.descuentoSobre(new BigDecimal("120000"))).isEqualByComparingTo("18000");
    }

    @Test
    void redondeaAlPesoConMedioHaciaArriba() {
        // 10 % de 15005 = 1500,5
        assertThat(Cupon.F1AUDI.descuentoSobre(new BigDecimal("15005"))).isEqualByComparingTo("1501");
        // 15 % de 15001 = 2250,15
        assertThat(Cupon.NEUBURG2026.descuentoSobre(new BigDecimal("15001"))).isEqualByComparingTo("2250");
    }
}
