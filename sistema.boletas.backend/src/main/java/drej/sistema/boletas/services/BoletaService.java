package drej.sistema.boletas.services;

import drej.sistema.boletas.models.Boleta;
import drej.sistema.boletas.models.Concepto;
import drej.sistema.boletas.models.Persona;
import drej.sistema.boletas.models.record.BoletaDTO;
import drej.sistema.boletas.models.record.ConceptoDTO;
import drej.sistema.boletas.models.record.RegPensionarioDetalleDTO;
import drej.sistema.boletas.repository.BoletaRepository;
import drej.sistema.boletas.repository.PersonaRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class BoletaService {

    private final BoletaRepository boletaRepository;
    private final PersonaRepository personaRepository;

    public BoletaService(BoletaRepository boletaRepository, PersonaRepository personaRepository) {
        this.boletaRepository = boletaRepository;
        this.personaRepository = personaRepository;
    }

    // Subir varias boletas
    @Transactional
    public void guardarBoletas(List<BoletaDTO> lista) {
        for (BoletaDTO dto : lista) {
            guardarBoleta(dto);
        }
    }

    // Guardar 1 boleta
    @Transactional
    public Boleta guardarBoleta(BoletaDTO dto) {
        // Buscar o crear Persona
        Persona persona = personaRepository.findByDocumentoIdentidad(dto.documento_identidad())
                .orElseGet(() -> {
                    Persona p = new Persona();
                    p.setNombres(dto.nombres());
                    p.setApellidos(dto.apellidos());
                    p.setDocumentoIdentidad(dto.documento_identidad());
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                    LocalDate fecha = null;
                    String fechaNacimientoStr = dto.fecha_nacimiento();
                    if (fechaNacimientoStr != null && !fechaNacimientoStr.isBlank()) {
                        fecha = LocalDate.parse(fechaNacimientoStr, formatter);
                    }
                    p.setFechaNacimiento(fecha);
                    return personaRepository.save(p);
                });

        // Actualiza campos si hay datos nuevos
        boolean actualizado = false;
        if (dto.nombres() != null && !dto.nombres().isBlank() && !dto.nombres().equals(persona.getNombres())) {
            persona.setNombres(dto.nombres());
            actualizado = true;
        }
        if (dto.apellidos() != null && !dto.apellidos().isBlank() && !dto.apellidos().equals(persona.getApellidos())) {
            persona.setApellidos(dto.apellidos());
            actualizado = true;
        }
        String fechaNacimientoStr = dto.fecha_nacimiento();
        if (fechaNacimientoStr != null && !fechaNacimientoStr.isBlank()) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            LocalDate fecha = LocalDate.parse(fechaNacimientoStr, formatter);
            if (persona.getFechaNacimiento() == null || !fecha.equals(persona.getFechaNacimiento())) {
                persona.setFechaNacimiento(fecha);
                actualizado = true;
            }
        }
        if (actualizado) {
            personaRepository.save(persona);
        }

        // Crear boleta y asociar Persona
        Boleta boleta = new Boleta();
        boleta.setArchivoOrigen(dto.archivo_origen());
        boleta.setRawLength(dto.raw_length());
        boleta.setSecuencia(dto.secuencia());
        boleta.setTipoPensionista(dto.tipo_pensionista());
        boleta.setTipoPension(dto.tipo_pension());
        boleta.setLeyendaMensual(dto.leyenda_mensual());
        boleta.setRegimenPensionario(dto.regimen_pensionario());
        boleta.setCodigoEncabezado(dto.codigo_encabezado());
        boleta.setRucBloque(dto.ruc_bloque());
        boleta.setMes(dto.mes());
        boleta.setAnio(dto.anio());
        boleta.setEstado(dto.estado());
        boleta.setEstablecimiento(dto.establecimiento());
        boleta.setCargo(dto.cargo());
        boleta.setTipoServidor(dto.tipo_servidor());
        boleta.setNivelMagHoras(dto.nivel_mag_horas());
        boleta.setTiempoServicio(dto.tiempo_servicio());
        boleta.setLeyendaPermanente(dto.leyenda_permanente());
        boleta.setFechaIngresoRegistro(dto.fecha_ingreso_registro());
        boleta.setFechaTerminoRegistro(dto.fecha_termino_registro());
        boleta.setCuentaPrincipal(dto.cuenta_principal());
        boleta.setCuentasTodas(dto.cuentas_todas());
        boleta.setTotalRemuneraciones(dto.total_remuneraciones());
        boleta.setTotalDescuentos(dto.total_descuentos());
        boleta.setTotalLiquido(dto.total_liquido());
        boleta.setMontoImponible(dto.monto_imponible());
        boleta.setPersona(persona);

        if (dto.conceptos() != null) {
            List<Concepto> conceptos = dto.conceptos().stream()
                    .map(cdto -> {
                        Concepto c = new Concepto();
                        c.setTipo(cdto.tipo());
                        c.setConcepto(cdto.concepto());
                        c.setMonto(cdto.monto());
                        c.setBoleta(boleta);
                        return c;
                    })
                    .toList();
            boleta.setConceptos(conceptos);
        }
        boletaRepository.save(boleta);
        return boleta;
    }

    // Obtener boleta por ID
    public Optional<Boleta> obtenerBoleta(Long id) {
        return boletaRepository.findById(id);
    }

    // Editar boleta
    @Transactional
    public Boleta editarBoleta(Long id, BoletaDTO dto) {
        Boleta boleta = boletaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Boleta no encontrada"));
        // Actualiza los campos según tus necesidades
        boleta.setEstado(dto.estado());
        boleta.setMes(dto.mes());
        boleta.setAnio(dto.anio());
        // ... otros campos
        // Notas: puedes actualizar más según lo que permita tu lógica
        return boletaRepository.save(boleta);
    }

    // Eliminar boleta
    @Transactional
    public void eliminarBoleta(Long id) {
        boletaRepository.deleteById(id);
    }

    // Exportar boletas (CSV o PDF - implementar según tu caso)
    public byte[] exportarBoletasCSV(List<BoletaDTO> boletas) {
        // Implementar exportación a CSV y retornar byte[]
        return new byte[0];
    }

    // Listar boletas (global)
    public List<BoletaDTO> listarBoletasDTO() {
        return boletaRepository.findAll().stream()
                .map(this::toBoletaDTO)
                .toList();
    }

    // Listar boletas paginado
    public Page<Boleta> listarBoletasPaginado(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return boletaRepository.findAll(pageable);
    }

    // Buscar boletas por filtros (ejemplo por estado, rango fechas, etc.)
    public List<BoletaDTO> buscarBoletasPorEstado(String estado) {
        return boletaRepository.findAll().stream()
                .filter(b -> estado.equals(b.getEstado()))
                .map(this::toBoletaDTO)
                .toList();
    }

    // Obtener boletas por persona ID
    public List<BoletaDTO> obtenerBoletasID(Long personaId) {
        return boletaRepository.findByPersonaId(personaId)
                .stream()
                .map(this::toBoletaDTO)
                .toList();
    }

    // Obtener boletas por persona
    public List<BoletaDTO> obtenerBoletasPersona(Persona persona){
        return boletaRepository.findByPersona(persona)
                .stream()
                .map(this::toBoletaDTO)
                .toList();
    }

    // Convertidor boletas
    public BoletaDTO toBoletaDTO(Boleta boleta) {
        Persona persona = boleta.getPersona();
        return new BoletaDTO(
                boleta.getArchivoOrigen(),
                boleta.getRawLength(),
                boleta.getConceptos().stream()
                        .map(c -> new ConceptoDTO(c.getTipo(), c.getConcepto(), c.getMonto()))
                        .toList(),
                boleta.getSecuencia(),
                boleta.getCodigoEncabezado(),
                boleta.getRucBloque(),
                boleta.getMes(),
                boleta.getAnio(),
                boleta.getEstado(),
                persona.getApellidos(),
                persona.getNombres(),
                persona.getFechaNacimiento() != null ? persona.getFechaNacimiento().toString() : null,
                persona.getDocumentoIdentidad(),
                boleta.getEstablecimiento(),
                boleta.getCargo(),
                boleta.getTipoServidor(),
                boleta.getTipoPensionista(),
                boleta.getTipoPension(),
                boleta.getNivelMagHoras(),
                boleta.getTiempoServicio(),
                boleta.getLeyendaPermanente(),
                boleta.getLeyendaMensual(),
                boleta.getFechaIngresoRegistro(),
                boleta.getFechaTerminoRegistro(),
                boleta.getCuentaPrincipal(),
                boleta.getCuentasTodas(),
                boleta.getRegPensionarioDetalle() == null ? null :
                        new RegPensionarioDetalleDTO(
                                boleta.getRegPensionarioDetalle().getRaw(),
                                boleta.getRegPensionarioDetalle().getAfiliacion()
                        ),
                boleta.getRegimenPensionario(),
                boleta.getTotalRemuneraciones(),
                boleta.getTotalDescuentos(),
                boleta.getTotalLiquido(),
                boleta.getMontoImponible()
        );
    }

    // Listar todas las boletas (entidad)
    public List<Boleta> listarBoletas() {
        return boletaRepository.findAll();
    }
}