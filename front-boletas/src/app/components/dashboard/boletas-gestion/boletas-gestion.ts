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
  changeDetection: ChangeDetectionStrategy.OnPush, // rendimiento: sólo refresca cuando hay cambios detectados
  imports: [CommonModule, FormsModule]
})
export class BoletasGestion implements OnInit {
  // Lista de personas y estado de carga/paginación
  personas: PersonaDTO[] = [];
  personaLoading = false;
  personaPage = 0;
  totalPersonaPages = 0;

  // Filtro global (busca en personas y en boletas ya precargadas)
  filtro = '';
  prefetchLimit = 10; // cuántas boletas prefetchear por página cuando se activa el filtro

  // Expansión y almacenamiento de boletas por persona
  expanded: Set<number> = new Set<number>();           // ids de personas expandidas
  boletasByPersona: Record<number, BoletaDTO[]> = {}; // cache local de boletas por persona
  loadingPersonaId: number | null = null;             // id que está cargando boletas (muestra spinner)

  // Modales y edición
  editandoPersona: PersonaDTO | null = null;
  showEditarPersonaModal = false;

  editandoBoleta: BoletaDTO | null = null;
  showEditarBoletaModal = false;

  constructor(
    private adminService: AdminService, // servicio para operaciones admin (personas/boletas)
    private boletaService: BoletaService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Carga inicial de personas al montar el componente
    this.cargarPersonas();
  }

  // Carga personas del servidor (por página)
  cargarPersonas(page: number = 0) {
    this.personaLoading = true;
    this.adminService.listarPersonas(page).subscribe({
      next: (result) => {
        // result expected: { content: PersonaDTO[], totalPages, number }
        this.personas = result.content;
        this.totalPersonaPages = result.totalPages;
        this.personaPage = result.number;
        this.personaLoading = false;
        this.cd.markForCheck(); // marca para que OnPush detecte cambios

        // Si el usuario está filtrando (>=2 letras), prefetch de boletas para mejor UX
        if (this.filtro.trim().length >= 2) {
          this.prefetchBoletasForPage();
        }
      },
      error: () => {
        // En caso de error sólo desactiva el loader y fuerza check
        this.personaLoading = false;
        this.cd.markForCheck();
      }
    });
  }

  // Cuando cambia el texto del filtro: prefetch si es conveniente
  onFiltroChange() {
    const term = this.filtro.trim();
    if (term.length >= 2) {
      this.prefetchBoletasForPage();
    }
  }

  // Prefetch: recorre las personas en la página y solicita boletas para algunas (hasta prefetchLimit)
  prefetchBoletasForPage() {
    let count = 0;
    for (const p of this.personas) {
      if (p.id == null) continue;
      if (!(p.id in this.boletasByPersona)) {
        this.cargarBoletasPersona(p.id, true); // silent = true (sin mostrar spinner global)
        count++;
        if (count >= this.prefetchLimit) break;
      }
    }
  }

  // Expande/contrae la fila de una persona. Si se expande y no hay boletas, las carga.
  toggleExpand(persona: PersonaDTO, event?: MouseEvent) {
    if (event) event.stopPropagation(); // evitar bubbling al hacer click
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

  // Comprueba si una persona está expandida
  isExpanded(id?: number): boolean {
    if (id == null) return false;
    return this.expanded.has(id);
  }

  // Carga boletas para una persona; silent=true evita mostrar spinner global
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

  // Filtra la lista de personas según el texto; también busca en boletas ya cargadas
  filtrarPersonas(): PersonaDTO[] {
    const f = this.filtro.trim().toLowerCase();
    if (!f) return this.personas;

    return this.personas.filter(p => {
      const matchPersona =
        (p.nombres ?? '').toLowerCase().includes(f) ||
        (p.apellidos ?? '').toLowerCase().includes(f) ||
        (p.documentoIdentidad ?? '').toLowerCase().includes(f);

      if (matchPersona) return true;

      // Si no coincide en persona, busca en las boletas ya precargadas para esta persona
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

  // Filtra las boletas de una persona según el filtro actual
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

  // Abre modal de edición de persona (copia por valor para no mutar original)
  mostrarEditarPersona(persona: PersonaDTO, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.editandoPersona = { ...persona };
    this.showEditarPersonaModal = true;
    this.cd.markForCheck();
  }

  // Guarda persona editada: llama servicio y recarga personas al completarse
  guardarPersona() {
    const p = this.editandoPersona!;
    this.adminService.editarPersona(p.id!, p).subscribe({
      next: () => {
        this.editandoPersona = null;
        this.showEditarPersonaModal = false;
        this.cargarPersonas(this.personaPage); // recarga para mostrar cambios
        this.cd.markForCheck();
      },
      error: () => {
        // On error: cierra modal y fuerza check; puedes mostrar mensaje de error si quieres
        this.showEditarPersonaModal = false;
        this.cd.markForCheck();
      }
    });
  }

  // Elimina persona (confirma con el usuario)
  eliminarPersona(id: number, event?: MouseEvent) {
    if (event) event.stopPropagation();
    if (!confirm('¿Eliminar esta persona?')) return;
    this.adminService.eliminarPersona(id).subscribe(() => {
      // Limpia cache y recarga la página actual
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

  // Abrir modal de edición de boleta
  mostrarEditarBoleta(boleta: BoletaDTO, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.editandoBoleta = { ...boleta };
    this.showEditarBoletaModal = true;
    this.cd.markForCheck();
  }

  // Guardar boleta editada y actualizar cache local para la persona correspondiente
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

  // Eliminar boleta con confirmación y actualizar cache local
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

  // Busca el id de la persona que tiene la boleta con boletaId (usa la cache boletasByPersona)
  private findPersonaIdByBoleta(boletaId: number): number | null {
    for (const [key, list] of Object.entries(this.boletasByPersona)) {
      if (list.some(b => b.id === boletaId)) return Number(key);
    }
    return null;
  }

  // trackBy para mejorar rendimiento en ngFor
  trackByPersona = (_: number, p: PersonaDTO) => p.id ?? -1;
  trackByBoleta = (_: number, b: BoletaDTO) => b.id ?? -1;
}