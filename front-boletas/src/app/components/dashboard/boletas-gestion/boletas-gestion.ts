import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { BoletaDTO } from '../../../models/boleta.model';
import { PersonaDTO } from '../../../models/persona.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin';

@Component({
  selector: 'app-boletas-gestion',
  templateUrl: './boletas-gestion.html',
  styleUrls: ['./boletas-gestion.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class BoletasGestion implements OnInit {
  personas: PersonaDTO[] = [];
  personaLoading = false;
  personaPage = 0;
  pageSize = 10;
  totalPersonaPages = 1;
  filtro = '';

  expanded = new Set<number>();
  boletasByPersona: Record<number, BoletaDTO[]> = {};
  loadingPersonaId: number | null = null;

  editandoPersona: PersonaDTO | null = null;
  showEditarPersonaModal = false;
  editandoBoleta: BoletaDTO | null = null;
  showEditarBoletaModal = false;

  seccionesBoletaAbiertas = {
    basica: true,
    laboral: false,
    pension: false,
    economica: false,
    cuentas: false
  };

  constructor(private adminService: AdminService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarPersonas();
  }

  cargarPersonas() {
    this.personaLoading = true;
    this.adminService.listarPersonas().subscribe({
      next: (result) => {
        this.personas = Array.isArray(result) ? result : (result.content ?? []);
        this.recalcularPaginacion();
        this.personaLoading = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.personaLoading = false;
        this.cd.markForCheck();
      }
    });
  }

  onFiltroChange() {
    this.personaPage = 0;
    this.recalcularPaginacion();
    this.cd.markForCheck();
  }

  recalcularPaginacion() {
    const totalFiltered = this.filtrarPersonas().length;
    this.totalPersonaPages = Math.max(1, Math.ceil(totalFiltered / this.pageSize));
    this.personaPage = Math.min(this.personaPage, this.totalPersonaPages - 1);
  }

  toggleExpand(personaId: number, event?: Event) {
    if (event) event.stopPropagation();
    if (this.expanded.has(personaId)) {
      this.expanded.delete(personaId);
    } else {
      this.expanded.add(personaId);
      if (!this.boletasByPersona[personaId]) {
        this.cargarBoletasPersona(personaId);
      }
    }
    this.cd.markForCheck();
  }

  isExpanded(id?: number): boolean {
    return id != null && this.expanded.has(id);
  }

  cargarBoletasPersona(personaId: number) {
    this.loadingPersonaId = personaId;
    this.adminService.listarBoletasPorPersona(personaId).subscribe({
      next: (boletas) => {
        this.boletasByPersona[personaId] = boletas || [];
        this.loadingPersonaId = null;
        this.cd.markForCheck();
      },
      error: () => {
        this.boletasByPersona[personaId] = [];
        this.loadingPersonaId = null;
        this.cd.markForCheck();
      }
    });
  }

  filtrarPersonas(): PersonaDTO[] {
    const f = this.filtro.trim().toLowerCase();
    if (!f) return this.personas;

    return this.personas.filter(p => {
      return (p.nombres ?? '').toLowerCase().includes(f) ||
        (p.apellidos ?? '').toLowerCase().includes(f) ||
        (p.documento_identidad ?? '').toLowerCase().includes(f);
    });
  }

  get paginatedPersonas(): PersonaDTO[] {
    const allFiltered = this.filtrarPersonas();
    const start = this.personaPage * this.pageSize;
    return allFiltered.slice(start, start + this.pageSize);
  }

  boletasFiltradas(personaId: number): BoletaDTO[] {
    return this.boletasByPersona[personaId] || [];
  }

  mostrarEditarPersona(persona: PersonaDTO, event?: Event) {
    if (event) event.stopPropagation();
    this.editandoPersona = { ...persona };
    this.showEditarPersonaModal = true;
    this.cd.markForCheck();
  }

  guardarPersona() {
    const p = this.editandoPersona!;
    this.adminService.editarPersona(p.id!, p).subscribe({
      next: () => {
        this.showEditarPersonaModal = false;
        this.editandoPersona = null;
        this.cargarPersonas();
      },
      error: () => {
        this.showEditarPersonaModal = false;
        this.cd.markForCheck();
      }
    });
  }

  eliminarPersona(id: number, event?: Event) {
    if (event) event.stopPropagation();
    if (!confirm('¿Eliminar esta persona y todas sus boletas?')) return;
    this.adminService.eliminarPersona(id).subscribe(() => {
      this.expanded.delete(id);
      delete this.boletasByPersona[id];
      this.cargarPersonas();
    });
  }

  cancelarEdicionPersona() {
    this.editandoPersona = null;
    this.showEditarPersonaModal = false;
    this.cd.markForCheck();
  }

  mostrarEditarBoleta(boleta: BoletaDTO, event?: Event) {
    if (event) event.stopPropagation();
    this.editandoBoleta = { ...boleta };
    this.seccionesBoletaAbiertas = { basica: true, laboral: false, pension: false, economica: false, cuentas: false };
    this.showEditarBoletaModal = true;
    this.cd.markForCheck();
  }

  toggleSeccionBoleta(seccion: keyof typeof this.seccionesBoletaAbiertas) {
    this.seccionesBoletaAbiertas[seccion] = !this.seccionesBoletaAbiertas[seccion];
    this.cd.markForCheck();
  }

  guardarBoleta() {
    const b = this.editandoBoleta!;
    if (!b.id) return;
    this.adminService.editarBoleta(b.id, b).subscribe({
      next: () => {
        const personaId = this.findPersonaIdByBoleta(b.id!);
        if (personaId != null) {
          this.boletasByPersona[personaId] = this.boletasByPersona[personaId].map(x => x.id === b.id ? b : x);
        }
        this.showEditarBoletaModal = false;
        this.editandoBoleta = null;
        this.cd.markForCheck();
      },
      error: () => {
        this.showEditarBoletaModal = false;
        this.cd.markForCheck();
      }
    });
  }

  eliminarBoleta(boletaId: number, personaId: number, event?: Event) {
    if (event) event.stopPropagation();
    if (!confirm('¿Eliminar esta boleta?')) return;
    this.adminService.eliminarBoleta(boletaId).subscribe(() => {
      this.boletasByPersona[personaId] = this.boletasByPersona[personaId].filter(b => b.id !== boletaId);
      this.cd.markForCheck();
    });
  }

  cancelarEdicionBoleta() {
    this.editandoBoleta = null;
    this.showEditarBoletaModal = false;
    this.cd.markForCheck();
  }

  private findPersonaIdByBoleta(boletaId: number): number | null {
    for (const [key, list] of Object.entries(this.boletasByPersona)) {
      if (list.some(b => b.id === boletaId)) return Number(key);
    }
    return null;
  }

  imprimirBoleta(boleta: BoletaDTO, event?: Event) {
    if (event) event.stopPropagation();
    if (!boleta?.id) return;
    window.open(`${window.location.origin}/boleta/${boleta.id}`, '_blank', 'noopener,noreferrer');
  }

  goToPrevPage() {
    if (this.personaPage > 0) {
      this.personaPage--;
      this.cd.markForCheck();
    }
  }

  goToNextPage() {
    if (this.personaPage < this.totalPersonaPages - 1) {
      this.personaPage++;
      this.cd.markForCheck();
    }
  }

  trackByPersona = (_: number, p: PersonaDTO) => p.id;
  trackByBoleta = (_: number, b: BoletaDTO) => b.id;
}