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
  @Input() boleta: BoletaDTO | null = null;
  @Output() close = new EventEmitter<void>();
  onClose() {
    this.close.emit();
  }
}