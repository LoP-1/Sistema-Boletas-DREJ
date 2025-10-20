package drej.sistema.boletas.controller;

import drej.sistema.boletas.models.record.BoletaDTO;
import drej.sistema.boletas.services.BoletaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/qr")
public class Boleta_QR {

    @Autowired
    private BoletaService boletaService;

    @GetMapping("/{id}")
    public ResponseEntity<BoletaDTO> getBoletaByQr(@PathVariable Long id) {
        return boletaService.obtenerBoleta(id)
                .map(boletaService::toBoletaDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}