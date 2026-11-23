package com.audi.usuarios.service;

import com.audi.usuarios.model.Usuario;
import com.audi.usuarios.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private UsuarioRepository repo;
    @Override
    public void run(String... args) {
        if (repo.count() == 0) {
            repo.save(new Usuario(null, "Admin", "Jefe", "admin@duoc.cl", "1234", "11111111-1", "Región Metropolitana", "Santiago", "ROLE_ADMIN"));
            repo.save(new Usuario(null, "Vendedor", "Paddock", "vendedor@duoc.cl", "1234", "22222222-2", "Región Metropolitana", "Providencia", "ROLE_VENDEDOR"));
            repo.save(new Usuario(null, "Cliente", "Fan", "cliente@gmail.com", "1234", "33333333-3", "Región de Valparaíso", "Viña del Mar", "ROLE_CLIENTE"));
            System.out.println(">>> [Microservice Usuario] Usuarios ADMIN, VENDEDOR y CLIENTE creados.");
        }
    }
}
