import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BoletaDTO } from '../../../models/boleta.model';
import { PersonaDTO } from '../../../models/persona.model';
import { AdminService } from '../../../services/admin';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  personaSeleccionada: PersonaDTO | null = null;

  // CRUD Persona
  nuevaPersona: PersonaDTO = { id: undefined, nombres: '', apellidos: '', documentoIdentidad: '', fechaNacimiento: '' };
  editandoPersona: PersonaDTO | null = null;

  // Boletas
  boletas: BoletaDTO[] = [];
  boletaLoading = false;

  // CRUD Boleta
  editandoBoleta: BoletaDTO | null = null;
  nuevaBoleta: BoletaDTO = { secuencia: '', mes: '', anio: '', estado: '', nombres: '', apellidos: '', documento_identidad: '', fecha_nacimiento: '', raw_length: 0, archivo_origen: '', conceptos: [], tipo_servidor: '', tipo_pensionista: '', tipo_pension: '', nivel_mag_horas: '', tiempo_servicio: '', leyenda_permanente: '', leyenda_mensual: '', fecha_ingreso_registro: '', fecha_termino_registro: '', cuenta_principal: '', cuentas_todas: [], regimen_pensionario: '', reg_pensionario_detalle: undefined, total_remuneraciones: 0, total_descuentos: 0, total_liquido: 0, monto_imponible: 0, establecimiento: '', cargo: '' };

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
      },
      error: () => { this.personaLoading = false; this.cd.detectChanges(); }
    });
  }

  filtrarPersonas(): PersonaDTO[] {
    const f = this.filtro.trim().toLowerCase();
    if (!f) return this.personas;
    return this.personas.filter(p =>
      p.nombres?.toLowerCase().includes(f) ||
      p.apellidos?.toLowerCase().includes(f) ||
      p.documentoIdentidad?.toLowerCase().includes(f)
    );
  }

  seleccionarPersona(persona: PersonaDTO) {
    this.personaSeleccionada = persona;
    this.cargarBoletasPersona(persona.id!);
  }

  cancelarSeleccion() {
    this.personaSeleccionada = null;
    this.boletas = [];
    this.editandoPersona = null;
    this.editandoBoleta = null;
    this.cd.detectChanges();
  }

  // CRUD Personas
  mostrarEditarPersona(persona: PersonaDTO) {
    this.editandoPersona = { ...persona };
  }

  guardarPersona() {
    const p = this.editandoPersona!;
    this.adminService.editarPersona(p.id!, p).subscribe({
      next: (personaActualizada) => {
        this.mensaje('Persona actualizada');
        this.editandoPersona = null;
        this.cargarPersonas(this.personaPage);
      },
      error: () => this.mensaje('Error actualizando persona')
    });
  }

  eliminarPersona(id: number) {
    if (!confirm('¿Eliminar esta persona?')) return;
    this.adminService.eliminarPersona(id).subscribe(() => {
      this.mensaje('Persona eliminada');
      this.cargarPersonas(this.personaPage);
      if (this.personaSeleccionada?.id === id) this.cancelarSeleccion();
    });
  }

  agregarPersona() {
    this.adminService.crearPersona(this.nuevaPersona).subscribe({
      next: (personaCreada) => {
        this.mensaje('Persona creada');
        this.nuevaPersona = { id: undefined, nombres: '', apellidos: '', documentoIdentidad: '', fechaNacimiento: '' };
        this.cargarPersonas(this.personaPage);
      },
      error: () => this.mensaje('Error creando persona')
    });
  }

  cancelarEdicionPersona() {
    this.editandoPersona = null;
    this.cd.detectChanges();
  }

  // BOLETAS
  cargarBoletasPersona(personaId: number) {
    this.boletaLoading = true;
    this.adminService.listarBoletasPorPersona(personaId).subscribe({
      next: (boletas) => {
        this.boletas = boletas;
        this.boletaLoading = false;
        this.cd.detectChanges();
      },
      error: () => { this.boletaLoading = false; this.cd.detectChanges(); }
    });
  }

  mostrarEditarBoleta(boleta: BoletaDTO) {
    this.editandoBoleta = { ...boleta };
  }

  guardarBoleta() {
    const b = this.editandoBoleta!;
    this.adminService.editarBoleta(b.id!, b).subscribe({
      next: () => {
        this.mensaje('Boleta actualizada');
        this.editandoBoleta = null;
        this.cargarBoletasPersona(this.personaSeleccionada!.id!);
      },
      error: () => this.mensaje('Error actualizando boleta')
    });
  }

  eliminarBoleta(id: number) {
    if (!confirm('¿Eliminar esta boleta?')) return;
    this.adminService.eliminarBoleta(id).subscribe(() => {
      this.mensaje('Boleta eliminada');
      this.cargarBoletasPersona(this.personaSeleccionada!.id!);
    });
  }

  agregarBoleta() {
  }

  cancelarEdicionBoleta() {
    this.editandoBoleta = null;
    this.cd.detectChanges();
  }

  // Utilidad para mostrar mensajes
  mensaje(msg: string) {
    // Puedes implementar un snackbar/toast, por ahora solo log
    console.log(msg);
  }
}