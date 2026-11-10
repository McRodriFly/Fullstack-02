package com.audi.store.service;

import com.audi.store.model.Producto;
import com.audi.store.model.Usuario;
import com.audi.store.repository.ProductoRepository;
import com.audi.store.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public void run(String... args) throws Exception {
        // Cargar productos iniciales si la BD está vacía
        if (productoRepository.count() == 0) {
            productoRepository.save(new Producto(null, "Chaqueta Oficial F1", "Chaquetas", 120000.0, 10, "Chaqueta_1.jpeg", false, 0.0));
            productoRepository.save(new Producto(null, "Conjunto Deportivo F1", "Ropa", 85000.0, 15, "Conjunto_1.jpeg", true, 69000.0));
            productoRepository.save(new Producto(null, "Gorra Negra Audi F1", "Gorras", 35000.0, 25, "Gorra1.jpeg", false, 0.0));
            productoRepository.save(new Producto(null, "Gorra Edición Especial", "Gorras", 40000.0, 8, "Gorra2.jpeg", true, 32000.0));
            productoRepository.save(new Producto(null, "Gorra Clásica Audi F1", "Gorras", 35000.0, 20, "Gorra3.jpeg", false, 0.0));
            productoRepository.save(new Producto(null, "Llavero Metálico F1", "Accesorios", 15000.0, 50, "Llavero_1.jpeg", false, 0.0));
            productoRepository.save(new Producto(null, "Polera Tipo 1 - A", "Poleras", 45000.0, 12, "Polera_Tipo1_1.jpeg", false, 0.0));
            productoRepository.save(new Producto(null, "Polera Tipo 1 - B", "Poleras", 45000.0, 12, "Polera_Tipo1_2.jpeg", true, 36000.0));
            productoRepository.save(new Producto(null, "Polera Tipo 1 - C", "Poleras", 45000.0, 5, "Polera_Tipo1_3.jpeg", false, 0.0));
            productoRepository.save(new Producto(null, "Polera Tipo 2 - A", "Poleras", 50000.0, 10, "Polera_Tipo2_1.jpeg", false, 0.0));
            productoRepository.save(new Producto(null, "Polera Tipo 2 - B", "Poleras", 50000.0, 10, "Polera_Tipo2_2.jpeg", true, 40000.0));
            productoRepository.save(new Producto(null, "Polera Tipo 2 - C", "Poleras", 50000.0, 7, "Polera_Tipo2_3.jpeg", false, 0.0));
            System.out.println(">>> [Seed] 12 productos cargados en H2.");
        }

        // Cargar usuarios con roles solicitados por la pauta (ADMIN, VENDEDOR, CLIENTE)
        if (usuarioRepository.count() == 0) {
            usuarioRepository.save(new Usuario(null, "Admin", "Jefe", "admin@duoc.cl", "1234", "11111111-1", "Región Metropolitana", "Santiago", "ROLE_ADMIN"));
            usuarioRepository.save(new Usuario(null, "Vendedor", "Paddock", "vendedor@duoc.cl", "1234", "22222222-2", "Región Metropolitana", "Providencia", "ROLE_VENDEDOR"));
            usuarioRepository.save(new Usuario(null, "Cliente", "Fan", "cliente@gmail.com", "1234", "33333333-3", "Región de Valparaíso", "Viña del Mar", "ROLE_CLIENTE"));
            System.out.println(">>> [Seed] Usuarios ADMIN, VENDEDOR y CLIENTE creados.");
        }
    }
}
