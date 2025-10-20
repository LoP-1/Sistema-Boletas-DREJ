package drej.sistema.boletas.controller;

import drej.sistema.boletas.config.JwtUtil;
import drej.sistema.boletas.models.Boleta;
import drej.sistema.boletas.models.Usuario;
import drej.sistema.boletas.models.record.BoletaDTO;
import drej.sistema.boletas.models.record.PersonaDTO;
import drej.sistema.boletas.services.BoletaService;
import drej.sistema.boletas.services.PersonaService;
import drej.sistema.boletas.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private BoletaService boletaService;

    @Autowired
    private PersonaService personaService;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtUtil jwtUtil;

    // ----------------------- BOLETAS (ADMIN) -----------------------

    // Listar todas las boletas paginadas
    @GetMapping("/boletas")
    public ResponseEntity<Page<BoletaDTO>> listarBoletas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size
    ) {
        Page<Boleta> boletas = boletaService.listarBoletasPaginado(page, size);
        Page<BoletaDTO> dtos = boletas.map(boletaService::toBoletaDTO);
        return ResponseEntity.ok(dtos);
    }

    // Listar boletas de una persona por id
    @GetMapping("/boletas/persona/{personaId}")
    public ResponseEntity<List<BoletaDTO>> listarBoletasPorPersona(@PathVariable Long personaId) {
        List<BoletaDTO> boletas = boletaService.obtenerBoletasID(personaId);
        return ResponseEntity.ok(boletas);
    }

    // Subir/crear varias boletas
    @PostMapping("/boletas")
    public ResponseEntity<?> subirBoletas(@RequestBody List<BoletaDTO> lista) {
        boletaService.guardarBoletas(lista);
        return ResponseEntity.ok().build();
    }

    // Editar boleta
    @PutMapping("/boletas/{id}")
    public ResponseEntity<BoletaDTO> editarBoleta(@PathVariable Long id, @RequestBody BoletaDTO dto) {
        Boleta boleta = boletaService.editarBoleta(id, dto);
        return ResponseEntity.ok(boletaService.toBoletaDTO(boleta));
    }

    // Eliminar boleta
    @DeleteMapping("/boletas/{id}")
    public ResponseEntity<?> eliminarBoleta(@PathVariable Long id) {
        boletaService.eliminarBoleta(id);
        return ResponseEntity.ok().build();
    }

    // ----------------------- PERSONAS (ADMIN) -----------------------

    // Listar todas las personas paginadas (DTO)
    @GetMapping("/personas")
    public ResponseEntity<Page<PersonaDTO>> listarPersonas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size
    ) {
        var pageable = org.springframework.data.domain.PageRequest.of(page, size);
        var personas = personaService.listarPersonasPaginado(pageable);
        return ResponseEntity.ok(personas);
    }

    // Crear persona
    @PostMapping("/personas")
    public ResponseEntity<PersonaDTO> crearPersona(@RequestBody PersonaDTO dto) {
        PersonaDTO nueva = personaService.crearPersona(dto);
        return ResponseEntity.ok(nueva);
    }

    // Editar persona
    @PutMapping("/personas/{id}")
    public ResponseEntity<PersonaDTO> editarPersona(@PathVariable Long id, @RequestBody PersonaDTO dto) {
        PersonaDTO editada = personaService.editarPersona(id, dto);
        return ResponseEntity.ok(editada);
    }

    // Eliminar persona
    @DeleteMapping("/personas/{id}")
    public ResponseEntity<?> eliminarPersona(@PathVariable Long id) {
        personaService.eliminarPersona(id);
        return ResponseEntity.ok().build();
    }

    // ----------------------- USUARIOS (ADMIN) -----------------------

    // Listar todos los usuarios (solo admin)
    @GetMapping("/usuarios")
    public ResponseEntity<?> listarUsuarios(@RequestHeader("Authorization") String token) {
        if (!jwtUtil.isAdmin(token)) {
            return ResponseEntity.status(403).body("No autorizado");
        }
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    // Cambiar estado de usuario (solo admin)
    @PutMapping("/usuarios/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Long id,
            @RequestBody boolean nuevoEstado,
            @RequestHeader("Authorization") String token
    ) {
        if (!jwtUtil.isAdmin(token)) {
            return ResponseEntity.status(403).body("No autorizado");
        }
        Usuario actualizado = usuarioService.actualizarEstado(id, nuevoEstado);
        return ResponseEntity.ok(actualizado);
    }
}