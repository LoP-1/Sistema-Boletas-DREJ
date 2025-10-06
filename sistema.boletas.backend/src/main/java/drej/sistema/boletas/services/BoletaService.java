package drej.sistema.boletas.services;

import drej.sistema.boletas.models.Boleta;
import drej.sistema.boletas.models.Concepto;
import drej.sistema.boletas.models.Persona;
import drej.sistema.boletas.models.dto.BoletaDTO;
import drej.sistema.boletas.repository.BoletaRepository;
import drej.sistema.boletas.repository.PersonaRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class BoletaService {

    private final BoletaRepository boletaRepository;
    private final PersonaRepository personaRepository;

    public BoletaService(BoletaRepository boletaRepository, PersonaRepository personaRepository) {
        this.boletaRepository = boletaRepository;
        this.personaRepository = personaRepository;
    }

    @Transactional
    public void guardarBoletas(List<BoletaDTO> lista) {
        for (BoletaDTO dto : lista) {
            guardarBoleta(dto);
        }
    }

    //guardar 1 boleta en la base de datos
    @Transactional
    public Boleta guardarBoleta(BoletaDTO dto) {
        // 1. Buscar o crear Persona
        Persona persona = personaRepository.findByDocumentoIdentidad(dto.documento_identidad())
                .orElseGet(() -> {
                    Persona p = new Persona();
                    p.setNombres(dto.nombres());
                    p.setApellidos(dto.apellidos());
                    p.setDocumentoIdentidad(dto.documento_identidad());
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                    LocalDate fecha = LocalDate.parse(dto.fecha_nacimiento(), formatter);
                    p.setFechaNacimiento(fecha);
                    return personaRepository.save(p);
                });

        // 2. Crear Boleta y asociar Persona
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

    public List<Boleta> listarBoletas() {
        return boletaRepository.findAll();
    }
}