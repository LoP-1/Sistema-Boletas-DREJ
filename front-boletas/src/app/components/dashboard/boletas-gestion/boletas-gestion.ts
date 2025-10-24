import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { BoletaDTO } from '../../../models/boleta.model';
import { PersonaDTO } from '../../../models/persona.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin';
import { BoletaService } from '../../../services/boleta';

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
  totalPersonaPages = 0;

  filtro = '';
  prefetchLimit = 10;

  expanded: Set<number> = new Set<number>();
  boletasByPersona: Record<number, BoletaDTO[]> = {};
  loadingPersonaId: number | null = null;

  editandoPersona: PersonaDTO | null = null;
  showEditarPersonaModal = false;

  editandoBoleta: BoletaDTO | null = null;
  showEditarBoletaModal = false;

  constructor(
    private adminService: AdminService,
    private boletaService: BoletaService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarPersonas();
  }

  cargarPersonas(page: number = 0) {
    this.personaLoading = true;
    this.adminService.listarPersonas(page).subscribe({
      next: (result) => {
        this.personas = result.content;
        this.totalPersonaPages = result.totalPages;
        this.personaPage = result.number;
        this.personaLoading = false;
        this.cd.markForCheck();

        if (this.filtro.trim().length >= 2) {
          this.prefetchBoletasForPage();
        }
      },
      error: () => { this.personaLoading = false; this.cd.markForCheck(); }
    });
  }

  onFiltroChange() {
    const term = this.filtro.trim();
    if (term.length >= 2) {
      this.prefetchBoletasForPage();
    }
  }

  prefetchBoletasForPage() {
    let count = 0;
    for (const p of this.personas) {
      if (p.id == null) continue;
      if (!(p.id in this.boletasByPersona)) {
        this.cargarBoletasPersona(p.id, true);
        count++;
        if (count >= this.prefetchLimit) break;
      }
    }
  }

  toggleExpand(persona: PersonaDTO, event?: MouseEvent) {
    if (event) event.stopPropagation();
    const id = persona.id!;
    if (this.expanded.has(id)) {
      this.expanded.delete(id);
    } else {
      this.expanded.add(id);
      if (!(id in this.boletasByPersona)) {
        this.cargarBoletasPersona(id);
      }
    }
  }

  isExpanded(id?: number): boolean {
    if (id == null) return false;
    return this.expanded.has(id);
  }

  cargarBoletasPersona(personaId: number, silent = false) {
    if (!silent) this.loadingPersonaId = personaId;
    this.adminService.listarBoletasPorPersona(personaId).subscribe({
      next: (boletas) => {
        this.boletasByPersona[personaId] = boletas;
        if (!silent) this.loadingPersonaId = null;
        this.cd.markForCheck();
      },
      error: () => {
        if (!silent) this.loadingPersonaId = null;
        this.cd.markForCheck();
      }
    });
  }

  filtrarPersonas(): PersonaDTO[] {
    const f = this.filtro.trim().toLowerCase();
    if (!f) return this.personas;

    return this.personas.filter(p => {
      const matchPersona =
        (p.nombres ?? '').toLowerCase().includes(f) ||
        (p.apellidos ?? '').toLowerCase().includes(f) ||
        (p.documentoIdentidad ?? '').toLowerCase().includes(f);

      if (matchPersona) return true;

      const pid = p.id ?? -1;
      const boletas = this.boletasByPersona[pid] ?? [];
      const matchBoleta = boletas.some(b =>
        (b.establecimiento ?? '').toLowerCase().includes(f) ||
        (b.cargo ?? '').toLowerCase().includes(f) ||
        (b.estado ?? '').toLowerCase().includes(f) ||
        (b.mes ?? '').toLowerCase().includes(f) ||
        (b.anio ?? '').toLowerCase().includes(f) ||
        (b.secuencia ?? '').toLowerCase().includes(f)
      );
      return matchBoleta;
    });
  }

  boletasFiltradas(personaId: number): BoletaDTO[] {
    const all = this.boletasByPersona[personaId] ?? [];
    const f = this.filtro.trim().toLowerCase();
    if (!f) return all;
    return all.filter(b =>
      (b.establecimiento ?? '').toLowerCase().includes(f) ||
      (b.cargo ?? '').toLowerCase().includes(f) ||
      (b.estado ?? '').toLowerCase().includes(f) ||
      (b.mes ?? '').toLowerCase().includes(f) ||
      (b.anio ?? '').toLowerCase().includes(f) ||
      (b.secuencia ?? '').toLowerCase().includes(f)
    );
  }

  mostrarEditarPersona(persona: PersonaDTO, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.editandoPersona = { ...persona };
    this.showEditarPersonaModal = true;
    this.cd.markForCheck();
  }

  guardarPersona() {
    const p = this.editandoPersona!;
    this.adminService.editarPersona(p.id!, p).subscribe({
      next: () => {
        this.editandoPersona = null;
        this.showEditarPersonaModal = false;
        this.cargarPersonas(this.personaPage);
        this.cd.markForCheck();
      },
      error: () => {
        this.showEditarPersonaModal = false;
        this.cd.markForCheck();
      }
    });
  }

  eliminarPersona(id: number, event?: MouseEvent) {
    if (event) event.stopPropagation();
    if (!confirm('¿Eliminar esta persona?')) return;
    this.adminService.eliminarPersona(id).subscribe(() => {
      this.expanded.delete(id);
      delete this.boletasByPersona[id];
      this.cargarPersonas(this.personaPage);
      this.cd.markForCheck();
    });
  }

  cancelarEdicionPersona() {
    this.editandoPersona = null;
    this.showEditarPersonaModal = false;
    this.cd.markForCheck();
  }

  mostrarEditarBoleta(boleta: BoletaDTO, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.editandoBoleta = { ...boleta };
    this.showEditarBoletaModal = true;
    this.cd.markForCheck();
  }

  guardarBoleta() {
    const b = this.editandoBoleta!;
    if (!b.id) return;
    this.adminService.editarBoleta(b.id, b).subscribe({
      next: () => {
        const personaId = this.findPersonaIdByBoleta(b.id!);
        if (personaId != null) {
          this.boletasByPersona[personaId] = (this.boletasByPersona[personaId] ?? []).map(x => x.id === b.id ? b : x);
        }
        this.editandoBoleta = null;
        this.showEditarBoletaModal = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.showEditarBoletaModal = false;
        this.cd.markForCheck();
      }
    });
  }

  eliminarBoleta(id: number, personaId: number, event?: MouseEvent) {
    if (event) event.stopPropagation();
    if (!confirm('¿Eliminar esta boleta?')) return;
    this.adminService.eliminarBoleta(id).subscribe(() => {
      this.boletasByPersona[personaId] = (this.boletasByPersona[personaId] ?? []).filter(b => b.id !== id);
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

  // trackBy para rendimiento
  trackByPersona = (_: number, p: PersonaDTO) => p.id ?? -1;
  trackByBoleta = (_: number, b: BoletaDTO) => b.id ?? -1;
}