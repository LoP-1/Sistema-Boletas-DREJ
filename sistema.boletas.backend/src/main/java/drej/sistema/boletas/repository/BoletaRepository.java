package drej.sistema.boletas.repository;


import drej.sistema.boletas.models.Boleta;
import org.springframework.data.jpa.repository.JpaRepository;
import drej.sistema.boletas.models.Persona;
import java.util.List;

public interface BoletaRepository extends JpaRepository<Boleta, Long> {
    List<Boleta> findByPersona(Persona persona);
    List<Boleta> findByPersonaId(Long personaId);
}