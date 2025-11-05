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
  // Servicios inyectados con inject() (alternativa al constructor)
  private personaService = inject(PersonaService);
  private boletaService = inject(BoletaService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private carritoService = inject(Carrito);

  // Datos básicos
  boletas: BoletaDTO[] = []; // todas las boletas del usuario
  boletasFiltradas: BoletaDTO[] = []; // boletas después de aplicar filtros
  
  // Filtros
  filtro = '';
  filtroAnio = '';
  filtroMes = '';
  
  // Opciones para los selectores
  todosLosAnios: string[] = [];
  todosLosMeses: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  // Contador
  totalBoletasFiltradas = 0;

  // Modal
  modalBoleta: BoletaDTO | null = null;
  
  // Loading
  loading = false;

  ngOnInit(): void {
    // Al iniciar carga las boletas del usuario logueado
    this.loadBoletasForLoggedUser();
  }

  // Carga boletas del usuario actual:
  // 1) obtiene el DNI del AuthService
  // 2) consulta PersonaService para obtener la persona
  // 3) lista boletas con BoletaService y agrupa
  loadBoletasForLoggedUser() {
    this.loading = true;
    const dni = this.authService.getDni();
    if (!dni) {
      this.loading = false;
      return;
    }

    this.personaService.obtenerPersonaPorDni(dni).subscribe({
      next: persona => {
        if (persona && persona.id != null) {
          this.boletaService.listarBoletasPersona(persona.id).subscribe({
            next: data => {
              this.boletas = data ?? [];
              
              // Extraer años únicos y ordenar descendente (más reciente primero)
              const aniosSet = new Set(this.boletas.map(b => b.anio?.toString() || ''));
              this.todosLosAnios = Array.from(aniosSet)
                .filter(a => a) // Filtrar vacíos
                .sort((a, b) => parseInt(b) - parseInt(a));
              
              // Aplicar filtros iniciales
              this.aplicarFiltros();
              this.loading = false;
              this.cdr.detectChanges();
            },
            error: err => {
              console.error('Error al cargar boletas:', err);
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: err => {
        console.error('Error al cargar persona:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltros() {
    let resultado = [...this.boletas];

    // Filtro por año
    if (this.filtroAnio) {
      resultado = resultado.filter(b => b.anio?.toString() === this.filtroAnio);
    }

    // Filtro por mes
    if (this.filtroMes) {
      resultado = resultado.filter(b => b.mes === this.filtroMes);
    }

    // Filtro por texto (busca en varios campos)
    if (this.filtro && this.filtro.trim()) {
      const textoLower = this.filtro.toLowerCase().trim();
      resultado = resultado.filter(b =>
        (b.establecimiento ?? '').toLowerCase().includes(textoLower) ||
        (b.cargo ?? '').toLowerCase().includes(textoLower) ||
        (b.estado ?? '').toLowerCase().includes(textoLower) ||
        (b.mes ?? '').toLowerCase().includes(textoLower) ||
        (b.anio ?? '').toLowerCase().includes(textoLower) ||
        (b.secuencia ?? '').toLowerCase().includes(textoLower) ||
        (b.tipo_servidor ?? '').toLowerCase().includes(textoLower) ||
        (b.tipo_pensionista ?? '').toLowerCase().includes(textoLower) ||
        (b.tipo_pension ?? '').toLowerCase().includes(textoLower) ||
        (b.nombres ?? '').toLowerCase().includes(textoLower) ||
        (b.apellidos ?? '').toLowerCase().includes(textoLower)
      );
    }

    // Ordenar por fecha descendente (más reciente primero)
    resultado.sort((a, b) => {
      // Primero comparar por año
      const anioA = parseInt(a.anio || '0');
      const anioB = parseInt(b.anio || '0');
      if (anioA !== anioB) return anioB - anioA;
      
      // Si el año es igual, comparar por mes
      const mesIndexA = this.todosLosMeses.indexOf(a.mes || '');
      const mesIndexB = this.todosLosMeses.indexOf(b.mes || '');
      return mesIndexB - mesIndexA;
    });

    this.boletasFiltradas = resultado;
    this.totalBoletasFiltradas = resultado.length;
    this.cdr.detectChanges();
  }

  onFiltroAnioChange() {
    this.aplicarFiltros();
  }

  onFiltroMesChange() {
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.filtro = '';
    this.filtroAnio = '';
    this.filtroMes = '';
    this.aplicarFiltros();
  }

  // Modal: abrir/cerrar
  openModal(boleta: BoletaDTO) {
    this.modalBoleta = boleta;
  }
  
  closeModal() {
    this.modalBoleta = null;
  }

  // Agregar boleta al carrito (usa el servicio Carrito)
  addToCart(boleta: BoletaDTO) {
    console.log('Boleta que se agrega:', boleta);
    this.carritoService.addBoleta(boleta);
  }

  // Atajo: agrega al carrito y abre el modal de detalle
  openModalAndAdd(boleta: BoletaDTO) {
    this.addToCart(boleta);
    this.openModal(boleta);
  }

  // TrackBy para optimización de rendimiento
  trackByBoleta(index: number, boleta: BoletaDTO): any {
    return boleta.id || index;
  }
}