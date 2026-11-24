package com.audi.store.ventas.internal.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Compra de un cliente con sesión iniciada.
 *
 * <p>El comprador se guarda solo como {@code usuarioId}: el módulo de usuarios es privado y
 * ventas no puede depender de sus entidades.
 */
@Entity
@Table(name = "boletas")
@Getter
@Setter
@NoArgsConstructor
public class Boleta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private Long usuarioId;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime fecha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoBoleta estado = EstadoBoleta.PAGADA;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal subtotal;

    /** Monto descontado en pesos (no el porcentaje del cupón). */
    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal total;

    @Column(name = "cupon_codigo", length = 30)
    private String cuponCodigo;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_entrega", nullable = false, length = 10)
    private TipoEntrega tipoEntrega;

    @Column(name = "direccion_envio", length = 200)
    private String direccionEnvio;

    @Column(length = 80)
    private String ciudad;

    @OneToMany(mappedBy = "boleta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleBoleta> detalles = new ArrayList<>();

    /** Agrega una línea y mantiene sincronizados los dos lados de la relación. */
    public void agregarDetalle(DetalleBoleta detalle) {
        detalle.setBoleta(this);
        detalles.add(detalle);
    }
}
