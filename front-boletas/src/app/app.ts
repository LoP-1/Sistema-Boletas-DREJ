import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { BoletaCart } from './components/dashboard/boleta-cart/boleta-cart';
import { BoletaDTO } from './models/boleta.model';
import { BoletaDetalle } from './dashboard/boleta-detalle/boleta-detalle'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, BoletaCart, BoletaDetalle],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  carrito = signal<BoletaDTO[]>([]);
  modalBoleta = signal<BoletaDTO | null>(null);

  abrirModal(boleta: BoletaDTO) {
    this.modalBoleta.set(boleta);
  }

  cerrarModal() {
    this.modalBoleta.set(null);
  }

  agregarAlCarrito(boleta: BoletaDTO) {
    const actual = this.carrito();
    if (!actual.find(b => b.secuencia === boleta.secuencia)) {
      this.carrito.set([...actual, boleta]);
    }
  }
}