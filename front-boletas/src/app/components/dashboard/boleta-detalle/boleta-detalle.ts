import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoletaDTO } from '../../../models/boleta.model';

@Component({
  selector: 'app-boleta-detail-modal',
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './boleta-detalle.html',
  styleUrls: ['./boleta-detalle.css']
})
export class BoletaDetalle {
  // Input: recibe la boleta que se va a mostrar (puede ser null si nada seleccionado)
  @Input() boleta: BoletaDTO | null = null;

  // Output: emite evento cuando se solicita cerrar el modal
  @Output() close = new EventEmitter<void>();

  // Método llamado desde la plantilla para cerrar el modal → emite el evento close
  onClose() {
    this.close.emit();
  }
}