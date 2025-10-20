import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { environment } from '../../../../enviroments/environment';
import { map, switchMap } from 'rxjs';
import QRCode from 'qrcode';

interface ConceptoDTO {
  tipo: string;
  concepto: string;
  monto: number;
}
interface RegPensionarioDetalleDTO {
  raw: string;
  afiliacion: string;
}
interface BoletaDTO {
  // ... igual que antes ...
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
  fecha_nacimiento: string | null;
  documento_identidad: string;
  establecimiento: string;
  cargo: string;
  tipo_servidor: string;
  tipo_pensionista: string | null;
  tipo_pension: string | null;
  nivel_mag_horas: string;
  tiempo_servicio: string;
  leyenda_permanente: string;
  leyenda_mensual: string | null;
  fecha_ingreso_registro: string;
  fecha_termino_registro: string;
  cuenta_principal: string;
  cuentas_todas: string[];
  reg_pensionario_detalle?: RegPensionarioDetalleDTO | null;
  regimen_pensionario: string | null;
  total_remuneraciones: number;
  total_descuentos: number;
  total_liquido: number;
  monto_imponible: number;
}

@Component({
  selector: 'app-boleta-print',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boleta-print.html',
  styleUrls: ['./boleta-print.css']
})
export class BoletaPrint implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  apiUrl = environment.apiUrl;
  boleta: BoletaDTO | null = null;
  ingresos: ConceptoDTO[] = [];
  descuentos: ConceptoDTO[] = [];
  qrDataUrl = '';
  shareUrl = '';

  cargando = true;
  error = '';

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((pm: ParamMap) => Number(pm.get('id'))),
        switchMap((id) => {
          if (!id) {
            this.error = 'Boleta no encontrada';
            this.cargando = false;
            this.cdr.detectChanges();
            return [];
          }

          // Reset antes de cargar
          this.cargando = true;
          this.error = '';
          this.boleta = null;
          this.ingresos = [];
          this.descuentos = [];
          this.qrDataUrl = '';
          this.shareUrl = `${window.location.origin}/boleta/${id}`;
          this.cdr.detectChanges();

          return this.http.get<BoletaDTO>(`${this.apiUrl}/qr/${id}`).pipe(
            map(data => ({ id, data }))
          );
        })
      )
      .subscribe({
        next: ({ id, data }) => {
          // Carga la boleta
          this.zone.run(() => {
            this.boleta = data;
            const conceptos = Array.isArray(this.boleta.conceptos) ? this.boleta.conceptos : [];
            this.ingresos = conceptos.filter(c => (c.tipo || '').toLowerCase().includes('ing'));
            this.descuentos = conceptos.filter(c => (c.tipo || '').toLowerCase().includes('desc'));
            // Genera el QR dentro de la zona
            QRCode.toDataURL(this.shareUrl, { margin: 1, width: 180 }).then(qr => {
              this.zone.run(() => {
                this.qrDataUrl = qr;
                this.cargando = false;
                this.cdr.detectChanges();
              });
            });
          });
        },
        error: () => {
          this.zone.run(() => {
            this.error = 'No se pudo cargar la boleta';
            this.cargando = false;
            this.cdr.detectChanges();
          });
        }
      });
  }

  imprimir() {
    window.print();
  }

  get estadoChipClasses(): string {
    const estado = (this.boleta?.estado || '').toUpperCase();
    if (estado.includes('ACT')) return 'bg-green-100 text-green-700';
    if (estado.includes('INA')) return 'bg-red-100 text-red-600';
    return 'bg-gray-100 text-gray-600';
  }
}