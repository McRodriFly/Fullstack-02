package com.audi.store.controller;

import com.audi.store.model.Producto;
import com.audi.store.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/productos")
@CrossOrigin(origins = "*") // Permite llamadas desde el frontend React (Vite en puerto 5173)
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    // LEER TODOS
    @GetMapping
    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    // LEER POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Long id) {
        Optional<Producto> producto = productoRepository.findById(id);
        return producto.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // LEER OFERTAS
    @GetMapping("/ofertas")
    public List<Producto> listarOfertas() {
        return productoRepository.findByOfertaTrue();
    }

    // CREAR (ADMIN / VENDEDOR)
    @PostMapping
    public Producto crearProducto(@RequestBody Producto producto) {
        return productoRepository.save(producto);
    }

    // ACTUALIZAR (ADMIN / VENDEDOR)
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Long id, @RequestBody Producto detalles) {
        Optional<Producto> opt = productoRepository.findById(id);
        if (opt.isPresent()) {
            Producto p = opt.get();
            p.setNombre(detalles.getNombre());
            p.setCategoria(detalles.getCategoria());
            p.setPrecio(detalles.getPrecio());
            p.setStock(detalles.getStock());
            p.setArchivo(detalles.getArchivo());
            p.setOferta(detalles.getOferta());
            p.setPrecioOferta(detalles.getPrecioOferta());
            return ResponseEntity.ok(productoRepository.save(p));
        }
        return ResponseEntity.notFound().build();
    }

    // ELIMINAR (ADMIN)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        if (productoRepository.existsById(id)) {
            productoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
