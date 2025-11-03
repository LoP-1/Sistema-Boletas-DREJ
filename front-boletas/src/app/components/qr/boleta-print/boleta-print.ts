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
  // Inyección de dependencias
  private http = inject(HttpClient);             
  private route = inject(ActivatedRoute);    
  private cdr = inject(ChangeDetectorRef);  
  private zone = inject(NgZone);              
  Math = Math;

  // URL base de la API (desde environment)
  apiUrl = environment.apiUrl;

  // Estado / datos del componente
  boleta: BoletaDTO | null = null;               // boleta cargada desde la API
  ingresos: ConceptoDTO[] = [];                  // conceptos de tipo ingreso
  descuentos: ConceptoDTO[] = [];                // conceptos de tipo descuento
  qrDataUrl = '';                                // DataURL del QR generado (imagen)
  shareUrl = '';                                 // URL pública para compartir / QR

  cargando = true;                               // flag de carga
  error = '';                                    // mensaje de error si hay problema

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((pm: ParamMap) => Number(pm.get('id'))),
        switchMap((id) => {
          if (!id) {
            // Si no hay id en la ruta, marcar error y terminar
            this.error = 'Boleta no encontrada';
            this.cargando = false;
            this.cdr.detectChanges();
            // return array vacío para cumplir con el tipo; no se emitirá next útil
            return [];
          }

          // Reset del estado antes de cargar la nueva boleta
          this.cargando = true;
          this.error = '';
          this.boleta = null;
          this.ingresos = [];
          this.descuentos = [];
          this.qrDataUrl = '';
          this.shareUrl = `${window.location.origin}/boleta/${id}`;
          this.cdr.detectChanges();

          // Petición HTTP para obtener la boleta por id
          return this.http.get<BoletaDTO>(`${this.apiUrl}/qr/${id}`).pipe(
            map(data => ({ id, data })) // empacar id y data para usarlo en subscribe
          );
        })
      )
      .subscribe({
        next: ({ id, data }) => {
          // Cuando llega la respuesta, actualizar estado dentro de NgZone
          this.zone.run(() => {
            this.boleta = data;

            // Asegurar que conceptos sea un array y separar ingresos/discounts por tipo
            const conceptos = Array.isArray(this.boleta.conceptos) ? this.boleta.conceptos : [];
            this.ingresos = conceptos.filter(c => (c.tipo || '').toLowerCase().includes('ing'));
            this.descuentos = conceptos.filter(c => (c.tipo || '').toLowerCase().includes('desc'));

            // Generar un QR en formato DataURL para la shareUrl
            QRCode.toDataURL(this.shareUrl, { margin: 1, width: 180 }).then(qr => {
              // Volver a la zona de Angular para actualizar bindings y UI
              this.zone.run(() => {
                this.qrDataUrl = qr;
                this.cargando = false;
                this.cdr.detectChanges();
              });
            });
          });
        },
        error: () => {
          // Manejo de error: actualizar mensajes y flags dentro de la zona
          this.zone.run(() => {
            this.error = 'No se pudo cargar la boleta';
            this.cargando = false;
            this.cdr.detectChanges();
          });
        }
      });
  }

  // Acción para imprimir la página (usa window.print)
  imprimir() {
    window.print();
  }

  // Getter que devuelve clases CSS para el chip de estado según el texto del estado
  get estadoChipClasses(): string {
    const estado = (this.boleta?.estado || '').toUpperCase();
    if (estado.includes('ACT')) return 'bg-green-100 text-green-700';
    if (estado.includes('INA')) return 'bg-red-100 text-red-600';
    return 'bg-gray-100 text-gray-600';
  }

  // Formatea una fecha (string) a DD/MM/YYYY. Si no es válida devuelve '---'
  formatFecha(fecha: string | null | undefined): string {
    if (!fecha) return '---';
    try {
      const d = new Date(fecha);
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const anio = d.getFullYear();
      return `${dia}/${mes}/${anio}`;
    } catch {
      return '---';
    }
  }

  // Indica si la boleta corresponde a un pensionista
  get esPensionista(): boolean {
    return !!this.boleta?.tipo_pensionista;
  }

  // Retorna el tipo de servidor o, si existe, el tipo de pensionista
  get tipoServidor(): string {
    if (this.boleta?.tipo_pensionista) return this.boleta.tipo_pensionista;
    if (this.boleta?.tipo_servidor) return this.boleta.tipo_servidor;
    return '---';
  }

  // Organiza los ingresos en pares (arrays de 2) para mostrar en 2 columnas en la plantilla
  get ingresosEnPares(): any[][] {
    const pares = [];
    for (let i = 0; i < this.ingresos.length; i += 2) {
      pares.push([this.ingresos[i], this.ingresos[i + 1]]);
    }
    return pares;
  }
}