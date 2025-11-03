import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { BoletaDTO } from '../../../models/boleta.model';
import { Carrito } from '../../../services/carrito';
import { BoletaDetalle } from '../../dashboard/boleta-detalle/boleta-detalle';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [BoletaDetalle, CommonModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css'
})
export class SideBar implements OnInit {
  // Evento que avisa al componente padre que debe cerrar el sidebar (usado en mobile)
  @Output() closeSidebar = new EventEmitter<void>();

  // Estado local
  modalBoleta: BoletaDTO | null = null; // boleta seleccionada para mostrar en modal detalle
  carrito: BoletaDTO[] = [];            // lista local del carrito (se sincroniza con el servicio)

  // Servicios inyectados por el constructor
  constructor(private carritoService: Carrito, private router: Router) {}

  // Al iniciar el componente nos suscribimos al observable del servicio Carrito
  ngOnInit() {
    // carrito$ emite la lista actualizada del carrito; actualizamos la copia local
    this.carritoService.carrito$.subscribe(carrito => {
      this.carrito = carrito || [];
      console.log('Carrito en sidebar:', this.carrito);
    });
  }

  // Quita una boleta del carrito por índice (delegamos al servicio)
  removeBoleta(index: number) {
    this.carritoService.removeBoleta(index);
  }

  // Abre el modal con el detalle de la boleta seleccionada
  verDetalle(boleta: BoletaDTO) {
    this.modalBoleta = boleta;
  }

  // Cierra el modal de detalle
  closeModal() {
    this.modalBoleta = null;
  }

  // Abre la boleta en una nueva pestaña (ruta pública /boleta/{id})
  imprimirBoleta(boleta: BoletaDTO) {
    if (boleta.id) {
      window.open(`/boleta/${boleta.id}`, '_blank');
    }
  }

  // trackBy para ngFor (mejora rendimiento: identifica items por índice)
  trackByIndex(index: number, item: any): number {
    return index;
  }

  // Emite al padre la señal de cerrar el sidebar
  close() {
    this.closeSidebar.emit();
  }

  // Acción de "Salir": limpia token/localStorage y navega al login
  salir() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userDni');
    localStorage.removeItem('userRol');
    this.router.navigate(['/login']);
  }
}