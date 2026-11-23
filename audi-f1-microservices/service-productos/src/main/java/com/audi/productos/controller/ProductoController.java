package com.audi.productos.controller;

import com.audi.productos.model.Producto;
import com.audi.productos.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/productos")
@CrossOrigin(origins = "*")
public class ProductoController {
    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping
    public List<Producto> listar() { return productoRepository.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtener(@PathVariable Long id) {
        Optional<Producto> p = productoRepository.findById(id);
        return p.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/ofertas")
    public List<Producto> listarOfertas() { return productoRepository.findByOfertaTrue(); }

    @PostMapping
    public Producto crear(@RequestBody Producto prod) { return productoRepository.save(prod); }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(@PathVariable Long id, @RequestBody Producto det) {
        Optional<Producto> opt = productoRepository.findById(id);
        if (opt.isPresent()) {
            Producto p = opt.get();
            p.setNombre(det.getNombre());
            p.setCategoria(det.getCategoria());
            p.setPrecio(det.getPrecio());
            p.setStock(det.getStock());
            p.setArchivo(det.getArchivo());
            p.setOferta(det.getOferta());
            p.setPrecioOferta(det.getPrecioOferta());
            return ResponseEntity.ok(productoRepository.save(p));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (productoRepository.existsById(id)) {
            productoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
