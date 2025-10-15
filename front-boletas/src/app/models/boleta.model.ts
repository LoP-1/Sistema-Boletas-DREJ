import { ConceptoDTO } from './concepto.model';
import { RegPensionarioDetalleDTO } from './reg-pensionario.model';

export interface BoletaDTO {
  id?: number;
  archivo_origen: string;
  raw_length: number;
  conceptos: ConceptoDTO[];
  secuencia: string;
  codigo_encabezado?: string;
  ruc_bloque?: string;
  mes: string;
  anio: string;
  estado: string;
  apellidos: string;
  nombres: string;
  fecha_nacimiento: string;
  documento_identidad: string;
  establecimiento: string;
  cargo: string;
  tipo_servidor: string;
  tipo_pensionista: string;
  tipo_pension: string;
  nivel_mag_horas: string;
  tiempo_servicio: string;
  leyenda_permanente: string;
  leyenda_mensual: string;
  fecha_ingreso_registro: string;
  fecha_termino_registro: string;
  cuenta_principal: string;
  cuentas_todas: string[];
  reg_pensionario_detalle?: RegPensionarioDetalleDTO;
  regimen_pensionario: string;
  total_remuneraciones: number;
  total_descuentos: number;
  total_liquido: number;
  monto_imponible: number
  }