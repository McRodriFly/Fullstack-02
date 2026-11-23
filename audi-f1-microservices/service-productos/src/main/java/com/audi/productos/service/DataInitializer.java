package com.audi.productos.service;

import com.audi.productos.model.Producto;
import com.audi.productos.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private ProductoRepository repo;
    @Override
    public void run(String... args) {
        if (repo.count() == 0) {
            repo.save(new Producto(null, "Chaqueta Oficial F1", "Chaquetas", 120000.0, 10, "Chaqueta_1.jpeg", false, 0.0));
            repo.save(new Producto(null, "Conjunto Deportivo F1", "Ropa", 85000.0, 15, "Conjunto_1.jpeg", true, 69000.0));
            repo.save(new Producto(null, "Gorra Negra Audi F1", "Gorras", 35000.0, 25, "Gorra1.jpeg", false, 0.0));
            repo.save(new Producto(null, "Gorra Edición Especial", "Gorras", 40000.0, 8, "Gorra2.jpeg", true, 32000.0));
            repo.save(new Producto(null, "Gorra Clásica Audi F1", "Gorras", 35000.0, 20, "Gorra3.jpeg", false, 0.0));
            repo.save(new Producto(null, "Llavero Metálico F1", "Accesorios", 15000.0, 50, "Llavero_1.jpeg", false, 0.0));
            repo.save(new Producto(null, "Polera Tipo 1 - A", "Poleras", 45000.0, 12, "Polera_Tipo1_1.jpeg", false, 0.0));
            repo.save(new Producto(null, "Polera Tipo 1 - B", "Poleras", 45000.0, 12, "Polera_Tipo1_2.jpeg", true, 36000.0));
            repo.save(new Producto(null, "Polera Tipo 1 - C", "Poleras", 45000.0, 5, "Polera_Tipo1_3.jpeg", false, 0.0));
            repo.save(new Producto(null, "Polera Tipo 2 - A", "Poleras", 50000.0, 10, "Polera_Tipo2_1.jpeg", false, 0.0));
            repo.save(new Producto(null, "Polera Tipo 2 - B", "Poleras", 50000.0, 10, "Polera_Tipo2_2.jpeg", true, 40000.0));
            repo.save(new Producto(null, "Polera Tipo 2 - C", "Poleras", 50000.0, 7, "Polera_Tipo2_3.jpeg", false, 0.0));
            System.out.println(">>> [Microservice Product] 12 productos cargados.");
        }
    }
}
