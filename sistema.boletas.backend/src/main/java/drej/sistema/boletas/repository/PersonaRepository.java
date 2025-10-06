package drej.sistema.boletas.repository;

import drej.sistema.boletas.models.Persona;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PersonaRepository extends JpaRepository<Persona, Long> {
    Optional<Persona> findByDocumentoIdentidad(String documentoIdentidad);
}
