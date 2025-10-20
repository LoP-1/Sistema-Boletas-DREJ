package drej.sistema.boletas.controller;

import drej.sistema.boletas.config.JwtUtil;
import drej.sistema.boletas.models.Usuario;
import drej.sistema.boletas.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtUtil jwtUtil;

    // Registro
    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
        return ResponseEntity.ok(nuevoUsuario);
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario usuario) {
        var userOpt = usuarioService.buscarPorCorreo(usuario.getCorreo());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("Usuario no encontrado");
        Usuario user = userOpt.get();
        if (!user.isEstadoCuenta()) return ResponseEntity.status(403).body("Cuenta no aprobada");
        if (!jwtUtil.passwordEncoder().matches(usuario.getContrasena(), user.getContrasena()))
            return ResponseEntity.status(403).body("Contraseña incorrecta");
        String token = jwtUtil.generateToken(user);
        return ResponseEntity.ok(token);
    }

    // Actualizar datos del usuario (propietario o admin)
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(
            @PathVariable Long id,
            @RequestBody Usuario usuarioActualizado,
            @RequestHeader("Authorization") String token
    ) {
        if (!jwtUtil.isAdmin(token) && !jwtUtil.isUser(token, id)) {
            return ResponseEntity.status(403).body("No autorizado");
        }
        Usuario actualizado = usuarioService.actualizarDatos(id, usuarioActualizado);
        return ResponseEntity.ok(actualizado);
    }

    // Cambiar contraseña (propietario o admin)
    @PutMapping("/{id}/contrasena")
    public ResponseEntity<?> cambiarContrasena(
            @PathVariable Long id,
            @RequestBody String nuevaContrasena,
            @RequestHeader("Authorization") String token
    ) {
        if (!jwtUtil.isUser(token, id) && !jwtUtil.isAdmin(token)) {
            return ResponseEntity.status(403).body("No autorizado");
        }
        usuarioService.cambiarContrasena(id, nuevaContrasena);
        return ResponseEntity.ok("Contraseña actualizada correctamente");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerUsuario(@PathVariable Long id) {
        return usuarioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}