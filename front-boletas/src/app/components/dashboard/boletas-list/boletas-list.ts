import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoletaDetalle } from '../boleta-detalle/boleta-detalle';
import { BoletaService } from '../../../services/boleta';
import { BoletaDTO } from '../../../models/boleta.model';
import { Router, NavigationEnd } from '@angular/router';// Ajusta el path según tu estructura
import { Carrito } from '../../../services/carrito';

@Component({
  selector: 'app-boletas-list',
  standalone: true,
  imports: [CommonModule, BoletaDetalle],
  templateUrl: './boletas-list.html',
  styleUrls: ['./boletas-list.css']
})
export class BoletasList implements OnInit {
  private boletaService = inject(BoletaService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private carritoService = inject(Carrito);

  boletas: BoletaDTO[] = [];
  grouped: { [anio: string]: { [mes: string]: BoletaDTO[] } } = {};

  selectedYear: string | null = null;
  selectedMonth: string | null = null;
  modalBoleta: BoletaDTO | null = null;

  ngOnInit(): void {
    this.loadBoletas();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.loadBoletas();
      }
    });
  }

  loadBoletas() {
    this.boletaService.getBoletasPorPersonaId(1).subscribe({
      next: data => {
        this.boletas = data;
        this.groupBoletas();
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error al cargar boletas:', err);
      }
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

  getKeys(obj: any): string[] {
    return Object.keys(obj);
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

  addToCart(boleta: BoletaDTO) {
    this.carritoService.addBoleta(boleta);
  }
}