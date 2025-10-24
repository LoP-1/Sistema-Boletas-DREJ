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
  @Output() closeSidebar = new EventEmitter<void>();
  
  modalBoleta: BoletaDTO | null = null;
  carrito: BoletaDTO[] = [];

  constructor(private carritoService: Carrito, private router: Router) {}

  ngOnInit() {
    this.carritoService.carrito$.subscribe(carrito => {
      this.carrito = carrito || [];
      console.log('Carrito en sidebar:', this.carrito);
    });
  }

  removeBoleta(index: number) {
    this.carritoService.removeBoleta(index);
  }

  verDetalle(boleta: BoletaDTO) {
    this.modalBoleta = boleta;
  }

  closeModal() {
    this.modalBoleta = null;
  }

  imprimirBoleta(boleta: BoletaDTO) {
    if (boleta.id) {
      window.open(`/boleta/${boleta.id}`, '_blank');
    }
  }
  
  trackByIndex(index: number, item: any): number {
    return index;
  }

  close() {
    this.closeSidebar.emit();
  }

  salir() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userDni');
    localStorage.removeItem('userRol');
    this.router.navigate(['/login']);
  }
  
}