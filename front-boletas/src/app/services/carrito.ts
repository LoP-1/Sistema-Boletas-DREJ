import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BoletaDTO } from '../models/boleta.model';

@Injectable({ providedIn: 'root' })
export class Carrito {
  private carritoSubject = new BehaviorSubject<BoletaDTO[]>([]);
  carrito$ = this.carritoSubject.asObservable();

  addBoleta(boleta: BoletaDTO) {
    const current = this.carritoSubject.value;
    if (!current.some(b => b.id === boleta.id)) {
      this.carritoSubject.next([...current, boleta]);
    }
  }

  removeBoleta(index: number) {
    const current = this.carritoSubject.value;
    this.carritoSubject.next(current.filter((_, i) => i !== index));
  }

  removeAllBoletas() {
    this.carritoSubject.next([]);
  }
}