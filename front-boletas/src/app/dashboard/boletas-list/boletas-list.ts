import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoletaService } from '../../services/boleta';
import { BoletaDTO } from '../../models/boleta.model';
import { BoletaDetalle } from '../boleta-detalle/boleta-detalle';

@Component({
  selector: 'app-boletas-list',
  standalone: true,
  imports: [CommonModule, BoletaDetalle],
  templateUrl: './boletas-list.html',
  styleUrls: ['./boletas-list.css']
})
export class BoletasList implements OnInit {
  public Object = Object;
  private boletaService = inject(BoletaService);

  boletas: BoletaDTO[] = [];
  grouped: {[anio: string]: {[mes: string]: BoletaDTO[]}} = {};

  selectedYear: string | null = null;
  selectedMonth: string | null = null;
  modalBoleta: BoletaDTO | null = null;

  ngOnInit(): void {
    this.boletaService.getBoletasPorPersonaId(1).subscribe(data => {
      this.boletas = data;
      this.groupBoletas();
    });
  }

  groupBoletas() {
    this.grouped = {};
    for (const boleta of this.boletas) {
      if (!this.grouped[boleta.anio]) {
        this.grouped[boleta.anio] = {};
      }
      if (!this.grouped[boleta.anio][boleta.mes]) {
        this.grouped[boleta.anio][boleta.mes] = [];
      }
      this.grouped[boleta.anio][boleta.mes].push(boleta);
    }
  }

  selectYear(anio: string) {
    this.selectedYear = anio;
    this.selectedMonth = null;
    this.modalBoleta = null;
  }

  selectMonth(mes: string) {
    this.selectedMonth = mes;
    this.modalBoleta = null;
  }

  openModal(boleta: BoletaDTO) {
    this.modalBoleta = boleta;
  }

  closeModal() {
    this.modalBoleta = null;
  }

  backToYears() {
    this.selectedYear = null;
    this.selectedMonth = null;
    this.modalBoleta = null;
  }

  backToMonths() {
    this.selectedMonth = null;
    this.modalBoleta = null;
  }
}