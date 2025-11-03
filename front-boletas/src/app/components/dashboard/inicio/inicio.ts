import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonaDTO } from '../../../models/persona.model';
import { BoletaDTO } from '../../../models/boleta.model';
import { PersonaService } from '../../../services/persona';
import { BoletaService } from '../../../services/boleta';
import { FormsModule } from '@angular/forms';
import { BoletaDetalle } from '../boleta-detalle/boleta-detalle';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, BoletaDetalle],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio implements OnInit {
  // Datos mostrados en la vista
  persona: PersonaDTO | null = null;         // persona logueada (obtenida por DNI)
  boletasRecientes: BoletaDTO[] = [];        // máximo 3 boletas ordenadas por fecha
  modalBoleta: BoletaDTO | null = null;      // boleta seleccionada para ver en modal

  // Paleta de colores para las tarjetas (3 esquemas suaves)
  private colorSchemes = [
    {
      card: 'bg-gradient-to-br from-blue-50 to-blue-100',
      headerBorder: 'border-blue-200',
      headerText: 'text-blue-800',
      subheaderText: 'text-blue-600',
      totalText: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700',
      badge: 'bg-blue-200 text-blue-800',
      border: 'border-blue-200'
    },
    {
      card: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      headerBorder: 'border-emerald-200',
      headerText: 'text-emerald-800',
      subheaderText: 'text-emerald-600',
      totalText: 'text-emerald-700',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      badge: 'bg-emerald-200 text-emerald-800',
      border: 'border-emerald-200'
    },
    {
      card: 'bg-gradient-to-br from-purple-50 to-purple-100',
      headerBorder: 'border-purple-200',
      headerText: 'text-purple-800',
      subheaderText: 'text-purple-600',
      totalText: 'text-purple-700',
      button: 'bg-purple-600 hover:bg-purple-700',
      badge: 'bg-purple-200 text-purple-800',
      border: 'border-purple-200'
    }
  ];

  constructor(
    private personaService: PersonaService,
    private boletaService: BoletaService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Lee DNI guardado en localStorage (lo mismo que hace AuthService en otros componentes)
    const dni = localStorage.getItem('userDni');

    if (dni) {
      // 1) Obtener la persona por DNI
      this.personaService.obtenerPersonaPorDni(dni).subscribe({
        next: (persona) => {
          this.persona = persona;
          this.cd.detectChanges();

          // 2) Si la persona existe, cargar sus boletas y elegir las 3 más recientes
          if (persona && persona.id != null) {
            this.boletaService.listarBoletasPersona(persona.id).subscribe({
              next: (boletas) => {
                // Filtra boletas válidas y ordena por año/mes (más recientes primero)
                const ordenadas = boletas
                  .filter(b => !!b.mes && !!b.anio)
                  .sort((a, b) => {
                    const dateA = Number(a.anio) * 100 + this.getMonthNumber(a.mes);
                    const dateB = Number(b.anio) * 100 + this.getMonthNumber(b.mes);
                    return dateB - dateA;
                  });
                // Guarda solo las 3 primeras
                this.boletasRecientes = ordenadas.slice(0, 3);
                this.cd.detectChanges();
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
  }

  // Convierte nombre de mes a número para ordenar correctamente
  private getMonthNumber(mes: string): number {
    const meses: { [key: string]: number } = {
      'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4,
      'Mayo': 5, 'Junio': 6, 'Julio': 7, 'Agosto': 8,
      'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12
    };
    return meses[mes] || 0;
  }

  // Métodos que devuelven clases CSS según el índice (0,1,2)
  // Usados en la plantilla para aplicar el esquema de colores correspondiente
  getCardColorClass(index: number): string {
    return this.colorSchemes[index]?.card || this.colorSchemes[0].card;
  }
  getHeaderBorderClass(index: number): string {
    return this.colorSchemes[index]?.headerBorder || this.colorSchemes[0].headerBorder;
  }
  getHeaderTextClass(index: number): string {
    return this.colorSchemes[index]?.headerText || this.colorSchemes[0].headerText;
  }
  getSubheaderTextClass(index: number): string {
    return this.colorSchemes[index]?.subheaderText || this.colorSchemes[0].subheaderText;
  }
  getTotalTextClass(index: number): string {
    return this.colorSchemes[index]?.totalText || this.colorSchemes[0].totalText;
  }
  getButtonClass(index: number): string {
    return this.colorSchemes[index]?.button || this.colorSchemes[0].button;
  }
  getBadgeClass(index: number): string {
    return this.colorSchemes[index]?.badge || this.colorSchemes[0].badge;
  }
  getBorderClass(index: number): string {
    return this.colorSchemes[index]?.border || this.colorSchemes[0].border;
  }

  // Abre modal con detalle de boleta
  verDetalle(boleta: BoletaDTO) {
    this.modalBoleta = boleta;
    this.cd.detectChanges();
  }

  // Cierra modal
  closeModal() {
    this.modalBoleta = null;
    this.cd.detectChanges();
  }
}