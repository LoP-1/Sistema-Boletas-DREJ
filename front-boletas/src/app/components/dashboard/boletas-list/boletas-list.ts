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

  // Exponer Math para usar en el template
  Math = Math;

  // Datos básicos
  boletas: BoletaDTO[] = []; // todas las boletas del usuario
  boletasFiltradas: BoletaDTO[] = []; // boletas después de aplicar filtros
  boletasPaginadas: BoletaDTO[] = []; // boletas de la página actual
  
  // Filtros
  filtro = '';
  filtroAnio = '';
  filtroMes = '';
  
  // Paginación
  paginaActual = 1;
  boletasPorPagina = 10;
  totalPaginas = 0;
  
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

  // Funciones helper para manejar estados null/undefined
  esEstadoActivo(estado: string | null | undefined): boolean {
    if (!estado) return false;
    const estadoUpper = estado.toUpperCase();
    return estadoUpper.includes('ACTIV') || estadoUpper.includes('HABIL');
  }

  getEstadoClasses(estado: string | null | undefined): string {
    if (this.esEstadoActivo(estado)) {
      return 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200';
    }
    return 'bg-gradient-to-r from-rose-100 to-rose-50 text-rose-700 border border-rose-200';
  }

  // Carga boletas del usuario actual:
  // 1) obtiene el DNI del AuthService
  // 2) consulta PersonaService para obtener la persona
  // 3) lista boletas con BoletaService
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
      const anioA = parseInt(a.anio || '0');
      const anioB = parseInt(b.anio || '0');
      if (anioA !== anioB) return anioB - anioA;
      
      const mesIndexA = this.todosLosMeses.indexOf(a.mes || '');
      const mesIndexB = this.todosLosMeses.indexOf(b.mes || '');
      return mesIndexB - mesIndexA;
    });

    this.boletasFiltradas = resultado;
    this.totalBoletasFiltradas = resultado.length;
    
    // Calcular paginación
    this.totalPaginas = Math.ceil(this.totalBoletasFiltradas / this.boletasPorPagina);
    
    // Resetear a página 1 cuando cambian los filtros
    this.paginaActual = 1;
    
    // Actualizar boletas paginadas
    this.actualizarBoletasPaginadas();
    
    this.cdr.detectChanges();
  }

  actualizarBoletasPaginadas() {
    const inicio = (this.paginaActual - 1) * this.boletasPorPagina;
    const fin = inicio + this.boletasPorPagina;
    this.boletasPaginadas = this.boletasFiltradas.slice(inicio, fin);
  }

  // Navegación de paginación
  irAPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarBoletasPaginadas();
    this.cdr.detectChanges();
    
    // Scroll suave al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  paginaAnterior() {
    this.irAPagina(this.paginaActual - 1);
  }

  paginaSiguiente() {
    this.irAPagina(this.paginaActual + 1);
  }

  // Generar array de números de página para mostrar
  get paginas(): number[] {
    const maxPaginasVisibles = 5;
    const paginas: number[] = [];
    
    if (this.totalPaginas <= maxPaginasVisibles) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= this.totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Mostrar páginas alrededor de la actual
      let inicio = Math.max(1, this.paginaActual - 2);
      let fin = Math.min(this.totalPaginas, this.paginaActual + 2);
      
      // Ajustar si estamos al principio o al final
      if (this.paginaActual <= 3) {
        fin = maxPaginasVisibles;
      } else if (this.paginaActual >= this.totalPaginas - 2) {
        inicio = this.totalPaginas - maxPaginasVisibles + 1;
      }
      
      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }
    }
    
    return paginas;
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

  // Agregar boleta al carrito
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