package drej.sistema.boletas.models.record;

public record PersonaDTO(
        Long id,
        String apellidos,
        String nombres,
        String documentoIdentidad,
        String fechaNacimiento) {
}
