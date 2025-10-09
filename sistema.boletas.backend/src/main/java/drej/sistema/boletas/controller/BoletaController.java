package drej.sistema.boletas.controller;

import drej.sistema.boletas.models.Boleta;
import drej.sistema.boletas.models.record.BoletaDTO;
import drej.sistema.boletas.services.BoletaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/boletas")
public class BoletaController {

    private final BoletaService boletaService;

    public BoletaController(BoletaService boletaService) {
        this.boletaService = boletaService;
    }

    @PostMapping
    public ResponseEntity<String> subirBoletas(@RequestBody List<BoletaDTO> boletas) {
        boletaService.guardarBoletas(boletas);
        return ResponseEntity.ok("Boletas guardadas correctamente.");
    }
    @GetMapping
    public List<Boleta> listarBoletas() {
        return boletaService.listarBoletas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<List<BoletaDTO>> listarBoletasPersona(@PathVariable Long id){
        List<BoletaDTO> respuesta = boletaService.obtenerBoletasID(id);
        return ResponseEntity.ok(respuesta);
    }
}
