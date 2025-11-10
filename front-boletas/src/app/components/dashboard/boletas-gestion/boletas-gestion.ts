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
  // Lista completa de personas cargadas desde el servicio
  personas: PersonaDTO[] = [];
  // Estado de carga global de personas
  personaLoading = false;

  // Paginación: página actual (0-based), tamaño de pagina y total de páginas calculadas
  personaPage = 0;
  pageSize = 10;
  totalPersonaPages = 1;

  // Filtro de búsqueda (nombre, apellido, dni)
  filtro = '';

  // Control de filas expandidas: set de personaId que están abiertas
  expanded = new Set<number>();
  // Mapa personaId -> boletas[]
  boletasByPersona: Record<number, BoletaDTO[]> = {};
  // Persona cuyo listado de boletas está en carga (id) o null
  loadingPersonaId: number | null = null;

  // Modal / edición de persona
  editandoPersona: PersonaDTO | null = null;
  showEditarPersonaModal = false;

  // Modal / edición de boleta
  editandoBoleta: BoletaDTO | null = null;
  showEditarBoletaModal = false;

  // Estado de secciones colapsables del modal de boleta
  seccionesBoletaAbiertas = {
    basica: true,
    laboral: false,
    pension: false,
    economica: false,
    cuentas: false
  };

  // Inyección de servicio y ChangeDetector (OnPush)
  constructor(private adminService: AdminService, private cd: ChangeDetectorRef) {}

  // Al iniciar, cargar lista de personas
  ngOnInit() {
    this.cargarPersonas();
  }

  // Cargar personas desde AdminService y actualizar estado / paginación
  cargarPersonas() {
    this.personaLoading = true;
    this.adminService.listarPersonas().subscribe({
      next: (result) => {
        // Acepta un array o un objeto paginado con content
        this.personas = Array.isArray(result) ? result : (result.content ?? []);
        this.recalcularPaginacion();
        this.personaLoading = false;
        this.cd.markForCheck(); // forzar check con OnPush
      },
      error: () => {
        // En error solo limpiar el flag de carga y refrescar vista
        this.personaLoading = false;
        this.cd.markForCheck();
      }
    });
  }

  // Resetea la página cuando cambia el filtro
  onFiltroChange() {
    this.personaPage = 0;
    this.recalcularPaginacion();
    this.cd.markForCheck();
  }

  // Recalcula totalPersonaPages y ajusta personaPage si es necesario
  recalcularPaginacion() {
    const totalFiltered = this.filtrarPersonas().length;
    this.totalPersonaPages = Math.max(1, Math.ceil(totalFiltered / this.pageSize));
    this.personaPage = Math.min(this.personaPage, this.totalPersonaPages - 1);
  }

  // Alterna la expansión de la fila de personas; si se expande y no hay boletas, las carga
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

  // Comprueba si una persona está expandida
  isExpanded(id?: number): boolean {
    return id != null && this.expanded.has(id);
  }

  // Carga boletas de una persona concreta y guarda en boletasByPersona
  cargarBoletasPersona(personaId: number) {
    this.loadingPersonaId = personaId;
    this.adminService.listarBoletasPorPersona(personaId).subscribe({
      next: (boletas) => {
        this.boletasByPersona[personaId] = boletas || [];
        this.loadingPersonaId = null;
        this.cd.markForCheck();
      },
      error: () => {
        // En error, dejar lista vacía para evitar reintentos infinitos
        this.boletasByPersona[personaId] = [];
        this.loadingPersonaId = null;
        this.cd.markForCheck();
      }
    });
  }

  // Filtra personas por filtro de búsqueda (nombre, apellido, dni)
  filtrarPersonas(): PersonaDTO[] {
    const f = this.filtro.trim().toLowerCase();
    if (!f) return this.personas;

    return this.personas.filter(p => {
      return (p.nombres ?? '').toLowerCase().includes(f) ||
        (p.apellidos ?? '').toLowerCase().includes(f) ||
        (p.documento_identidad ?? '').toLowerCase().includes(f);
    });
  }

  // Personas paginadas según personaPage y pageSize
  get paginatedPersonas(): PersonaDTO[] {
    const allFiltered = this.filtrarPersonas();
    const start = this.personaPage * this.pageSize;
    return allFiltered.slice(start, start + this.pageSize);
  }

  // Devuelve boletas cargadas para una persona
  boletasFiltradas(personaId: number): BoletaDTO[] {
    return this.boletasByPersona[personaId] || [];
  }

  // Abre modal de edición de persona (copia local para editar)
  mostrarEditarPersona(persona: PersonaDTO, event?: Event) {
    if (event) event.stopPropagation();
    this.editandoPersona = { ...persona };
    this.showEditarPersonaModal = true;
    this.cd.markForCheck();
  }

  // Guarda persona editada usando el servicio; recarga la lista al éxito
  guardarPersona() {
    const p = this.editandoPersona!;
    this.adminService.editarPersona(p.id!, p).subscribe({
      next: () => {
        this.showEditarPersonaModal = false;
        this.editandoPersona = null;
        this.cargarPersonas(); // refrescar datos origen
      },
      error: () => {
        // En error cerramos modal y refrescamos vista (se puede mejorar mostrando mensaje)
        this.showEditarPersonaModal = false;
        this.cd.markForCheck();
      }
    });
  }

  // Elimina persona (con confirm) y actualiza vistas y estructuras locales
  eliminarPersona(id: number, event?: Event) {
    if (event) event.stopPropagation();
    if (!confirm('¿Eliminar esta persona y todas sus boletas?')) return;
    this.adminService.eliminarPersona(id).subscribe(() => {
      this.expanded.delete(id);
      delete this.boletasByPersona[id];
      this.cargarPersonas();
    });
  }

  // Cancelar edición de persona: limpiar estado del modal
  cancelarEdicionPersona() {
    this.editandoPersona = null;
    this.showEditarPersonaModal = false;
    this.cd.markForCheck();
  }

  // Abre modal de edición de boleta (copia local) y resetea secciones colapsables
  mostrarEditarBoleta(boleta: BoletaDTO, event?: Event) {
    if (event) event.stopPropagation();
    this.editandoBoleta = { ...boleta };
    this.seccionesBoletaAbiertas = { basica: true, laboral: false, pension: false, economica: false, cuentas: false };
    this.showEditarBoletaModal = true;
    this.cd.markForCheck();
  }

  // Alterna la visibilidad de una sección dentro del modal de boleta
  toggleSeccionBoleta(seccion: keyof typeof this.seccionesBoletaAbiertas) {
    this.seccionesBoletaAbiertas[seccion] = !this.seccionesBoletaAbiertas[seccion];
    this.cd.markForCheck();
  }

  // Guarda la boleta editada y actualiza la lista local si corresponde
  guardarBoleta() {
    const b = this.editandoBoleta!;
    if (!b.id) return;
    this.adminService.editarBoleta(b.id, b).subscribe({
      next: () => {
        const personaId = this.findPersonaIdByBoleta(b.id!);
        if (personaId != null) {
          // Reemplaza la boleta local por la editada
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

  // Elimina una boleta y actualiza la lista local
  eliminarBoleta(boletaId: number, personaId: number, event?: Event) {
    if (event) event.stopPropagation();
    if (!confirm('¿Eliminar esta boleta?')) return;
    this.adminService.eliminarBoleta(boletaId).subscribe(() => {
      this.boletasByPersona[personaId] = this.boletasByPersona[personaId].filter(b => b.id !== boletaId);
      this.cd.markForCheck();
    });
  }

  // Cierra modal de boleta sin guardar
  cancelarEdicionBoleta() {
    this.editandoBoleta = null;
    this.showEditarBoletaModal = false;
    this.cd.markForCheck();
  }

  // Busca el personaId que contiene la boleta con boletaId en el mapa local
  private findPersonaIdByBoleta(boletaId: number): number | null {
    for (const [key, list] of Object.entries(this.boletasByPersona)) {
      if (list.some(b => b.id === boletaId)) return Number(key);
    }
    return null;
  }

  // Abre la vista/imprime la boleta en una nueva pestaña (ruta /boleta/:id)
  imprimirBoleta(boleta: BoletaDTO, event?: Event) {
    if (event) event.stopPropagation();
    if (!boleta?.id) return;
    window.open(`${window.location.origin}/boleta/${boleta.id}`, '_blank', 'noopener,noreferrer');
  }

  // Navegación de paginación: ir a página anterior
  goToPrevPage() {
    if (this.personaPage > 0) {
      this.personaPage--;
      this.cd.markForCheck();
    }
  }

  // Navegación de paginación: ir a la siguiente página
  goToNextPage() {
    if (this.personaPage < this.totalPersonaPages - 1) {
      this.personaPage++;
      this.cd.markForCheck();
    }
  }

  // trackBy para optimizar ngFor en personas y boletas
  trackByPersona = (_: number, p: PersonaDTO) => p.id;
  trackByBoleta = (_: number, b: BoletaDTO) => b.id;
}