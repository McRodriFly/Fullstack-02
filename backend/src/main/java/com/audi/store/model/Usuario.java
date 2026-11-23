package com.audi.store.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String apellidos;

    @Column(unique = true, nullable = false)
    private String correo;

    @Column(nullable = false)
    private String password;

    private String rut;
    private String region;
    private String comuna;

    // Roles: ROLE_ADMIN, ROLE_VENDEDOR, ROLE_CLIENTE
    @Column(nullable = false)
    private String rol = "ROLE_CLIENTE";
}
