package com.audi.store.controller;

import com.audi.store.model.Usuario;
import com.audi.store.repository.UsuarioRepository;
import com.audi.store.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario credenciales) {
        Optional<Usuario> userOpt = usuarioRepository.findByCorreo(credenciales.getCorreo());
        if (userOpt.isPresent()) {
            Usuario u = userOpt.get();
            if (u.getPassword().equals(credenciales.getPassword())) {
                String token = jwtUtils.generarToken(u.getCorreo(), u.getRol());
                
                Map<String, Object> respuesta = new HashMap<>();
                respuesta.put("token", token);
                respuesta.put("correo", u.getCorreo());
                respuesta.put("nombre", u.getNombre());
                respuesta.put("rol", u.getRol());
                return ResponseEntity.ok(respuesta);
            }
        }
        return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
    }

    @PostMapping("/registro")
    public ResponseEntity<Usuario> registrar(@RequestBody Usuario usuario) {
        if (usuario.getRol() == null) {
            usuario.setRol("ROLE_CLIENTE");
        }
        Usuario nuevo = usuarioRepository.save(usuario);
        return ResponseEntity.ok(nuevo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
