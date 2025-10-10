import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BoletaDTO } from '../../../models/boleta.model'; 
import { Carrito } from '../../../services/carrito';
import { BoletaDetalle } from '../../dashboard/boleta-detalle/boleta-detalle';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [RouterModule,BoletaDetalle,CommonModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css'
})
export class SideBar implements OnInit {  
  
  modalBoleta: BoletaDTO | null = null;
  carrito: BoletaDTO[] = [];

  constructor(private carritoService: Carrito) {}

  ngOnInit() {
    this.carritoService.carrito$.subscribe(carrito => {
      this.carrito = carrito;
    });
  }

  removeBoleta(index: number) {
    this.carritoService.removeBoleta(index);
  }

  removeAllBoletas() {
    this.carritoService.removeAllBoletas();
  }

  verDetalle(boleta: BoletaDTO) {
    this.modalBoleta = boleta;
  }

  closeModal() {
    this.modalBoleta = null;
  }
}