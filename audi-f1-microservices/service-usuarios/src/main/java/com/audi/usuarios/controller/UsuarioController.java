package com.audi.usuarios.controller;

import com.audi.usuarios.model.Usuario;
import com.audi.usuarios.repository.UsuarioRepository;
import com.audi.usuarios.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {
    @Autowired
    private UsuarioRepository repo;
    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping
    public List<Usuario> listar() { return repo.findAll(); }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario cred) {
        Optional<Usuario> uOpt = repo.findByCorreo(cred.getCorreo());
        if (uOpt.isPresent()) {
            Usuario u = uOpt.get();
            if (u.getPassword().equals(cred.getPassword())) {
                String token = jwtUtils.generarToken(u.getCorreo(), u.getRol());
                Map<String, Object> res = new HashMap<>();
                res.put("token", token);
                res.put("correo", u.getCorreo());
                res.put("nombre", u.getNombre());
                res.put("rol", u.getRol());
                return ResponseEntity.ok(res);
            }
        }
        return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
    }

    @PostMapping("/registro")
    public Usuario registrar(@RequestBody Usuario u) {
        if (u.getRol() == null) u.setRol("ROLE_CLIENTE");
        return repo.save(u);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
