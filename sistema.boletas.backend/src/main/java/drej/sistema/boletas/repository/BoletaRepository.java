package drej.sistema.boletas.repository;


import drej.sistema.boletas.models.Boleta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoletaRepository extends JpaRepository<Boleta, Long> {
}