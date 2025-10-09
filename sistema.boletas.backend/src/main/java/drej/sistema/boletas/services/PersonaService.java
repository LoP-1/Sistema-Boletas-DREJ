package drej.sistema.boletas.services;

import drej.sistema.boletas.models.Persona;
import drej.sistema.boletas.models.record.PersonaDTO;
import drej.sistema.boletas.repository.PersonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PersonaService {

    @Autowired
    PersonaRepository personaRepository;

    public Optional<PersonaDTO> buscarPersonaDni(String dni) {
        return personaRepository.findByDocumentoIdentidad(dni)
                .map(persona -> new PersonaDTO(
                        persona.getId(),
                        persona.getApellidos(),
                        persona.getNombres(),
                        persona.getDocumentoIdentidad(),
                        persona.getFechaNacimiento().toString()
                ));
    }
}
