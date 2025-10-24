import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoletaDetalle } from '../boleta-detalle/boleta-detalle';
import { BoletaDTO } from '../../../models/boleta.model';
import { Carrito } from '../../../services/carrito';
import { PersonaService } from '../../../services/persona';
import { BoletaService } from '../../../services/boleta';
import { AuthService } from '../../../services/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-boletas-list',
  standalone: true,
  imports: [CommonModule, BoletaDetalle, FormsModule],
  templateUrl: './boletas-list.html',
  styleUrls: ['./boletas-list.css']
})
export class BoletasList implements OnInit {
  private personaService = inject(PersonaService);
  private boletaService = inject(BoletaService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private carritoService = inject(Carrito);

  boletas: BoletaDTO[] = [];
  grouped: { [anio: string]: { [mes: string]: BoletaDTO[] } } = {};

  selectedYear: string | null = null;
  selectedMonth: string | null = null;
  modalBoleta: BoletaDTO | null = null;

  filtro = '';

  // Mapa de colores por mes
  private monthColors: { [key: string]: string } = {
    'Enero': 'bg-sky-100 border-sky-300 text-sky-800 hover:bg-sky-200',
    'Febrero': 'bg-pink-100 border-pink-300 text-pink-800 hover:bg-pink-200',
    'Marzo': 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200',
    'Abril': 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200',
    'Mayo': 'bg-lime-100 border-lime-300 text-lime-800 hover:bg-lime-200',
    'Junio': 'bg-cyan-100 border-cyan-300 text-cyan-800 hover:bg-cyan-200',
    'Julio': 'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200',
    'Agosto': 'bg-violet-100 border-violet-300 text-violet-800 hover:bg-violet-200',
    'Septiembre': 'bg-rose-100 border-rose-300 text-rose-800 hover:bg-rose-200',
    'Octubre': 'bg-teal-100 border-teal-300 text-teal-800 hover:bg-teal-200',
    'Noviembre': 'bg-indigo-100 border-indigo-300 text-indigo-800 hover:bg-indigo-200',
    'Diciembre': 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200'
  };

  ngOnInit(): void {
    this.loadBoletasForLoggedUser();
  }

  loadBoletasForLoggedUser() {
    const dni = this.authService.getDni();
    if (!dni) return;

    this.personaService.obtenerPersonaPorDni(dni).subscribe({
      next: persona => {
        if (persona && persona.id != null) {
          this.boletaService.listarBoletasPersona(persona.id).subscribe({
            next: data => {
              this.boletas = data ?? [];
              this.groupBoletas();
              this.cdr.detectChanges();
            },
            error: err => {
              console.error('Error al cargar boletas:', err);
            }
          });
        }
      },
      error: err => {
        console.error('Error al cargar persona:', err);
      }
    });
  }

  groupBoletas() {
    this.grouped = {};
    for (const boleta of this.boletas) {
      if (!boleta.anio || !boleta.mes) continue;
      if (!this.grouped[boleta.anio]) {
        this.grouped[boleta.anio] = {};
      }
      if (!this.grouped[boleta.anio][boleta.mes]) {
        this.grouped[boleta.anio][boleta.mes] = [];
      }
      this.grouped[boleta.anio][boleta.mes].push(boleta);
    }
  }

  // Agrupa a partir de boletas filtradas por texto
  get filteredGrouped(): { [anio: string]: { [mes: string]: BoletaDTO[] } } {
    const f = this.filtro.trim().toLowerCase();
    if (!f) return this.grouped;

    const result: { [anio: string]: { [mes: string]: BoletaDTO[] } } = {};
    for (const [anio, meses] of Object.entries(this.grouped)) {
      for (const [mes, list] of Object.entries(meses)) {
        const filtered = list.filter(b =>
          (b.establecimiento ?? '').toLowerCase().includes(f) ||
          (b.cargo ?? '').toLowerCase().includes(f) ||
          (b.estado ?? '').toLowerCase().includes(f) ||
          (b.mes ?? '').toLowerCase().includes(f) ||
          (b.anio ?? '').toLowerCase().includes(f) ||
          (b.secuencia ?? '').toLowerCase().includes(f) ||
          (b.tipo_servidor ?? '').toLowerCase().includes(f) ||
          (b.tipo_pensionista ?? '').toLowerCase().includes(f) ||
          (b.tipo_pension ?? '').toLowerCase().includes(f)
        );
        if (filtered.length) {
          if (!result[anio]) result[anio] = {};
          if (!result[anio][mes]) result[anio][mes] = [];
          result[anio][mes].push(...filtered);
        }
      }
    }
    return result;
  }

  getKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  // Retorna las clases CSS de color para cada mes
  getMonthColorClasses(mes: string): string {
    return this.monthColors[mes] || 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200';
  }

  selectYear(anio: string) {
    this.selectedYear = anio;
    this.selectedMonth = null;
    this.modalBoleta = null;
  }

  selectMonth(mes: string) {
    this.selectedMonth = mes;
    this.modalBoleta = null;
  }

  openModal(boleta: BoletaDTO) {
    this.modalBoleta = boleta;
  }

  closeModal() {
    this.modalBoleta = null;
  }

  backToYears() {
    this.selectedYear = null;
    this.selectedMonth = null;
    this.modalBoleta = null;
  }

  backToMonths() {
    this.selectedMonth = null;
    this.modalBoleta = null;
  }

  addToCart(boleta: BoletaDTO) {
    console.log('Boleta que se agrega:', boleta);
    this.carritoService.addBoleta(boleta);
  }

  openModalAndAdd(boleta: BoletaDTO) {
  this.addToCart(boleta);
  this.openModal(boleta);
}
}