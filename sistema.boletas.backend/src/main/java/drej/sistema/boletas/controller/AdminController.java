package drej.sistema.boletas.controller;

import drej.sistema.boletas.models.Boleta;
import drej.sistema.boletas.models.record.BoletaDTO;
import drej.sistema.boletas.models.record.PersonaDTO;
import drej.sistema.boletas.services.BoletaService;
import drej.sistema.boletas.services.PersonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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


    // Listar todas las boletas paginadas
    @GetMapping("/boletas")
    public ResponseEntity<Page<BoletaDTO>> listarBoletas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Page<Boleta> boletas = boletaService.listarBoletasPaginado(page, size);
        Page<BoletaDTO> dtos = boletas.map(boletaService::toBoletaDTO);
        return ResponseEntity.ok(dtos);
    }

    // Ver detalle de boleta
    @GetMapping("/boletas/{id}")
    public ResponseEntity<BoletaDTO> getBoleta(@PathVariable Long id) {
        return boletaService.obtenerBoleta(id)
                .map(boletaService::toBoletaDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Listar boletas de una persona por id
    @GetMapping("/boletas/persona/{personaId}")
    public ResponseEntity<List<BoletaDTO>> listarBoletasPorPersona(@PathVariable Long personaId) {
        List<BoletaDTO> boletas = boletaService.obtenerBoletasID(personaId);
        return ResponseEntity.ok(boletas);
    }

    // Subir/crear boletas
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

    // --- PERSONAS ---

    // Listar todas las personas paginadas
    @GetMapping("/personas")
    public ResponseEntity<Page<PersonaDTO>> listarPersonas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PersonaDTO> personas = personaService.listarPersonasPaginado(pageable);
        return ResponseEntity.ok(personas);
    }

    // Buscar persona por DNI
    @GetMapping("/personas/{dni}")
    public ResponseEntity<PersonaDTO> buscarPersonaPorDni(@PathVariable String dni) {
        return personaService.buscarPersonaDni(dni)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Buscar persona por ID
    @GetMapping("/personas/id/{id}")
    public ResponseEntity<PersonaDTO> buscarPersonaPorId(@PathVariable Long id) {
        return personaService.buscarPersonaId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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

    // --- EXPORTAR, ESTADÍSTICAS, LOGS ---

    // Exportar boletas (ejemplo, CSV)
    @GetMapping("/export/boletas")
    public ResponseEntity<byte[]> exportarBoletasCSV() {
        List<BoletaDTO> boletas = boletaService.listarBoletasDTO();
        byte[] archivo = boletaService.exportarBoletasCSV(boletas);
        return ResponseEntity
                .ok()
                .header("Content-Disposition", "attachment; filename=boletas.csv")
                .body(archivo);
    }

    // Estadísticas básicas (ejemplo)
    @GetMapping("/estadisticas")
    public ResponseEntity<?> estadisticas() {
        long totalPersonas = personaService.listarPersonas().size();
        long totalBoletas = boletaService.listarBoletas().size();
        return ResponseEntity.ok(
                new Object() {
                    public long personas = totalPersonas;
                    public long boletas = totalBoletas;
                }
        );
    }
}