package drej.sistema.boletas.models.dto;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public record BoletaDTO(
        String archivo_origen,
        int raw_length,
        List<ConceptoDTO> conceptos,
        String secuencia,
        String codigo_encabezado,
        String ruc_bloque,
        String mes,
        String anio,
        String estado,
        String apellidos,
        String nombres,
        String fecha_nacimiento,
        String documento_identidad,
        String establecimiento,
        String cargo,
        String tipo_servidor,
        String tipo_pensionista,      // NUEVO
        String tipo_pension,          // NUEVO
        String nivel_mag_horas,
        String tiempo_servicio,
        String leyenda_permanente,
        String leyenda_mensual,       // NUEVO
        String fecha_ingreso_registro,
        String fecha_termino_registro,
        String cuenta_principal,
        List<String> cuentas_todas,
        RegPensionarioDetalleDTO reg_pensionario_detalle,
        String regimen_pensionario,   // NUEVO
        double total_remuneraciones,
        double total_descuentos,
        double total_liquido,
        double monto_imponible
) {}
