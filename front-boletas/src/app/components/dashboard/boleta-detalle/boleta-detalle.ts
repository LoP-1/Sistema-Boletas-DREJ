import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoletaDTO } from '../../../models/boleta.model';
import { ConceptoDTO } from '../../../models/concepto.model';

@Component({
  selector: 'app-boleta-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boleta-detalle.html',
  styleUrls: ['./boleta-detalle.css'],
})
export class BoletaDetalle {
  @Input() boleta: BoletaDTO | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<BoletaDTO>();

  onClose() {
    this.close.emit();
  }
  //envia el objeto boleta al carrito
  onAddToCart() {
    if (this.boleta) this.addToCart.emit(this.boleta);
  }

  // Cerrar con tecla ESC
  @HostListener('document:keydown', ['$event'])
  onEscKey(event: Event) {
    const ke = event as KeyboardEvent;
    if (ke.key === 'Escape' || ke.key === 'Esc') {
      this.onClose();
    }
  }

  // Getters de conveniencia
  get ingresos(): ConceptoDTO[] {
    return (this.boleta?.conceptos || [])
      .filter(c => (c.tipo || '').toLowerCase() === 'ingreso')
      .slice()
      .sort((a, b) => b.monto - a.monto);
  }

  //recorrer los conceptos y extraer los egresos
  get egresos(): ConceptoDTO[] {
    return (this.boleta?.conceptos || [])
      .filter(c => (c.tipo || '').toLowerCase() === 'descuento')
      .slice()
      .sort((a, b) => b.monto - a.monto);
  }
  //sumar los ingresos para calcular el total
  get totalIngresosCalc(): number {
    if (this.boleta?.total_remuneraciones != null) return this.boleta.total_remuneraciones;
    return this.ingresos.reduce((s, c) => s + (c.monto || 0), 0);
  }

  //calcular el total de los egresos , sumando igual que antes
  get totalEgresosCalc(): number {
    if (this.boleta?.total_descuentos != null) return this.boleta.total_descuentos;
    return this.egresos.reduce((s, c) => s + (c.monto || 0), 0);
  }

  //calcular el total liquido
  get totalLiquidoCalc(): number {
    if (this.boleta?.total_liquido != null) return this.boleta.total_liquido;
    return this.totalIngresosCalc - this.totalEgresosCalc;
  }

  trackByConcepto(_: number, c: ConceptoDTO) {
    return `${c.tipo}:${c.concepto}:${c.monto}`;
  }

  get monthYear(): string {
    if (!this.boleta) return '';
    return `${this.boleta.mes} ${this.boleta.anio}`;
  }

  //poner estilos a los estados
  get estadoChipClasses(): string {
    const estado = (this.boleta?.estado || '').toLowerCase();
    if (estado.includes('habil')) return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300';
    if (estado.includes('pend') || estado.includes('obs')) return 'bg-amber-100 text-amber-800 ring-1 ring-amber-300';
    return 'bg-slate-100 text-slate-700 ring-1 ring-slate-300';
  }

  // Filas para tabla de datos generales (omite vacíos)
  get datosGenerales(): Array<{ label: string; value: string }> {
    if (!this.boleta) return [];
    const b = this.boleta;
    const rows: Array<{ label: string; value: string | null | undefined }> = [
      { label: 'Establecimiento', value: b.establecimiento },
      { label: 'Cargo', value: b.cargo },
      { label: 'Tipo Servidor/Pensionista', value: b.tipo_servidor || b.tipo_pensionista },
      { label: 'Tipo de Pensión', value: b.tipo_pension },
      { label: 'DNI', value: b.documento_identidad },
      { label: 'Secuencia', value: b.secuencia },
      { label: 'Nivel / Horas', value: b.nivel_mag_horas },
      { label: 'Régimen pensionario', value: b.regimen_pensionario },
      { label: 'Cuenta principal', value: b.cuenta_principal },
      { label: 'Cuentas', value: (b.cuentas_todas || []).join(' • ') || null },
      { label: 'Tiempo de servicio', value: b.tiempo_servicio },
      { label: 'Fecha ingreso registro', value: b.fecha_ingreso_registro },
      { label: 'Fecha término registro', value: b.fecha_termino_registro },
      { label: 'Leyenda permanente', value: b.leyenda_permanente },
      { label: 'Leyenda mensual', value: b.leyenda_mensual },
    ];
    return rows
      .filter(r => !!r.value && String(r.value).trim() !== '')
      .map(r => ({ label: r.label, value: String(r.value) }));
  }
}