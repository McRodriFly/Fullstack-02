package com.audi.store.catalogo.internal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Artículo a la venta. Los montos están en pesos chilenos, sin decimales. */
@Entity
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal precio;

    /** {@code null} cuando el producto no está en oferta. */
    @Column(name = "precio_oferta", precision = 12, scale = 0)
    private BigDecimal precioOferta;

    @Column(nullable = false)
    private String imagen;

    @Column(nullable = false)
    private int stock;

    public boolean estaEnOferta() {
        return precioOferta != null;
    }

    /** Precio que se cobra hoy: el de oferta si existe, el normal en caso contrario. */
    public BigDecimal precioVigente() {
        return estaEnOferta() ? precioOferta : precio;
    }
}
