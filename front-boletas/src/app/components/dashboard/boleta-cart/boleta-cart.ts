import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoletaDTO } from '../../../models/boleta.model';

@Component({
  selector: 'app-boleta-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boleta-cart.html',
  styleUrls: ['./boleta-cart.css']
})
export class BoletaCart {
  @Input() carrito: BoletaDTO[] = [];
  @Output() consultar = new EventEmitter<BoletaDTO>();

  abrirModal(boleta: BoletaDTO) {
    this.consultar.emit(boleta);
  }
}