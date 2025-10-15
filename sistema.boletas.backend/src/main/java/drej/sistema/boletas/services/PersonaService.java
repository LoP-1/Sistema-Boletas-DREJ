package drej.sistema.boletas.services;

import drej.sistema.boletas.models.Persona;
import drej.sistema.boletas.models.record.PersonaDTO;
import drej.sistema.boletas.repository.PersonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PersonaService {

    @Autowired
    PersonaRepository personaRepository;

    // Buscar persona por DNI
    public Optional<PersonaDTO> buscarPersonaDni(String dni) {
        return personaRepository.findByDocumentoIdentidad(dni)
                .map(this::toDTO);
    }

    // Buscar persona por ID
    public Optional<PersonaDTO> buscarPersonaId(Long id) {
        return personaRepository.findById(id)
                .map(this::toDTO);
    }

    // Listar todas las personas (entidad)
    public List<Persona> listarPersonas() {
        return personaRepository.findAll();
    }

    // Listar todas las personas (DTO)
    public List<PersonaDTO> listarPersonasDTO() {
        return personaRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    // Listar personas paginadas (DTO)
    public Page<PersonaDTO> listarPersonasPaginado(Pageable pageable) {
        return personaRepository.findAll(pageable).map(this::toDTO);
    }

    // Crear persona
    public PersonaDTO crearPersona(PersonaDTO dto) {
        Persona persona = new Persona();
        persona.setApellidos(dto.apellidos());
        persona.setNombres(dto.nombres());
        persona.setDocumentoIdentidad(dto.documentoIdentidad());
        persona.setFechaNacimiento(parseFecha(dto.fechaNacimiento()));
        Persona guardada = personaRepository.save(persona);
        return toDTO(guardada);
    }

    // Editar persona
    public PersonaDTO editarPersona(Long id, PersonaDTO dto) {
        Persona persona = personaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Persona no encontrada"));
        if (dto.apellidos() != null) persona.setApellidos(dto.apellidos());
        if (dto.nombres() != null) persona.setNombres(dto.nombres());
        if (dto.documentoIdentidad() != null) persona.setDocumentoIdentidad(dto.documentoIdentidad());
        if (dto.fechaNacimiento() != null) persona.setFechaNacimiento(parseFecha(dto.fechaNacimiento()));
        Persona guardada = personaRepository.save(persona);
        return toDTO(guardada);
    }

    // Eliminar persona
    public void eliminarPersona(Long id) {
        personaRepository.deleteById(id);
    }

    // Conversión segura a DTO
    private PersonaDTO toDTO(Persona persona) {
        return new PersonaDTO(
                persona.getId(),
                persona.getApellidos(),
                persona.getNombres(),
                persona.getDocumentoIdentidad(),
                persona.getFechaNacimiento() != null ? persona.getFechaNacimiento().toString() : null
        );
    }

    // Parseo seguro de fecha
    private LocalDate parseFecha(String fechaNacimiento) {
        if (fechaNacimiento == null || fechaNacimiento.isBlank()) return null;
        try {
            return LocalDate.parse(fechaNacimiento);
        } catch (Exception e) {
            return null;
        }
    }
}