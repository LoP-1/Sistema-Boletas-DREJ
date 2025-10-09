package drej.sistema.boletas.controller;

import drej.sistema.boletas.models.record.PersonaDTO;
import drej.sistema.boletas.services.PersonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/persona")
public class PersonaController {

    @Autowired
    PersonaService personaService;

    @GetMapping("/{dni}")
    public ResponseEntity<PersonaDTO> obtenerPersonaDni(@PathVariable String dni) {
        return personaService.buscarPersonaDni(dni)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
