import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  imports: [CommonModule, FormsModule]
})
export class BoletasGestion implements OnInit {
  personas: PersonaDTO[] = [];
  personaLoading = false;
  personaPage = 0;
  totalPersonaPages = 0;

  // Buscador
  filtro = '';
  prefetchLimit = 10; // cuántas personas intentar precargar boletas cuando el filtro tiene 2+ caracteres

  // Expansión y boletas
  expanded: Set<number> = new Set<number>();
  boletasByPersona: Record<number, BoletaDTO[]> = {};
  loadingPersonaId: number | null = null;

  // CRUD Persona
  nuevaPersona: PersonaDTO = { id: undefined, nombres: '', apellidos: '', documentoIdentidad: '', fechaNacimiento: '' };
  editandoPersona: PersonaDTO | null = null;

  // CRUD Boleta
  editandoBoleta: BoletaDTO | null = null;

  constructor(private adminService: AdminService, private cd: ChangeDetectorRef) {}

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
        this.cd.detectChanges();

        if (this.filtro.trim().length >= 2) {
          this.prefetchBoletasForPage();
        }
      },
      error: () => { this.personaLoading = false; this.cd.detectChanges(); }
    });
  }

  onFiltroChange() {
    // Precarga boletas de las primeras N personas para permitir match por boletas cuando hay filtro
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
        this.cd.detectChanges();
      },
      error: () => {
        if (!silent) this.loadingPersonaId = null;
        this.cd.detectChanges();
      }
    });
  }

  // Filtro: incluye persona si coincide persona o alguna boleta (si están cargadas o precargadas)
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

  // Para mostrar solo boletas que coinciden con el filtro cuando hay filtro activo
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

  // CRUD Personas
  mostrarEditarPersona(persona: PersonaDTO, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.editandoPersona = { ...persona };
  }

  isEditandoBoletaVisible(personaId: number): boolean {
    if (!this.editandoBoleta) return false;
    const boletas = this.boletasByPersona[personaId] ?? [];
    return boletas.some(x => x.id === this.editandoBoleta!.id);
  }

  guardarPersona() {
    const p = this.editandoPersona!;
    this.adminService.editarPersona(p.id!, p).subscribe({
      next: () => {
        this.editandoPersona = null;
        this.cargarPersonas(this.personaPage);
      },
      error: () => console.error('Error actualizando persona')
    });
  }

  eliminarPersona(id: number, event?: MouseEvent) {
    if (event) event.stopPropagation();
    if (!confirm('¿Eliminar esta persona?')) return;
    this.adminService.eliminarPersona(id).subscribe(() => {
      // Limpiar caché y expansión
      this.expanded.delete(id);
      delete this.boletasByPersona[id];
      this.cargarPersonas(this.personaPage);
    });
  }

  cancelarEdicionPersona() {
    this.editandoPersona = null;
    this.cd.detectChanges();
  }

  // CRUD Boletas en línea (editar/eliminar)
  mostrarEditarBoleta(boleta: BoletaDTO, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.editandoBoleta = { ...boleta };
  }

  guardarBoleta() {
    const b = this.editandoBoleta!;
    if (!b.id) return;
    this.adminService.editarBoleta(b.id, b).subscribe({
      next: () => {
        // Actualizar en caché
        const personaId = this.findPersonaIdByBoleta(b.id!);
        if (personaId != null) {
          // Reemplaza boleta en caché
          this.boletasByPersona[personaId] = (this.boletasByPersona[personaId] ?? []).map(x => x.id === b.id ? b : x);
        }
        this.editandoBoleta = null;
        this.cd.detectChanges();
      },
      error: () => console.error('Error actualizando boleta')
    });
  }

  eliminarBoleta(id: number, personaId: number, event?: MouseEvent) {
    if (event) event.stopPropagation();
    if (!confirm('¿Eliminar esta boleta?')) return;
    this.adminService.eliminarBoleta(id).subscribe(() => {
      // Quitar de caché
      this.boletasByPersona[personaId] = (this.boletasByPersona[personaId] ?? []).filter(b => b.id !== id);
      this.cd.detectChanges();
    });
  }

  cancelarEdicionBoleta() {
    this.editandoBoleta = null;
    this.cd.detectChanges();
  }

  private findPersonaIdByBoleta(boletaId: number): number | null {
    for (const [key, list] of Object.entries(this.boletasByPersona)) {
      if (list.some(b => b.id === boletaId)) return Number(key);
    }
    return null;
  }
}