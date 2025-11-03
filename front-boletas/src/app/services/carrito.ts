import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BoletaDTO } from '../models/boleta.model';

@Injectable({ providedIn: 'root' })
export class Carrito {
  // BehaviorSubject que mantiene la lista actual del carrito
  // cualquier componente puede suscribirse a carrito$ para recibir actualizaciones.
  private carritoSubject = new BehaviorSubject<BoletaDTO[]>([]);
  carrito$ = this.carritoSubject.asObservable();

  // Agrega una boleta al carrito si no existe (evita duplicados por id)
  addBoleta(boleta: BoletaDTO) {
    const current = this.carritoSubject.value;
    if (!current.some(b => b.id === boleta.id)) {
      this.carritoSubject.next([...current, boleta]);
    }
  }

  // Elimina una boleta por índice (se usa en la UI para remover un item seleccionado)
  removeBoleta(index: number) {
    const current = this.carritoSubject.value;
    this.carritoSubject.next(current.filter((_, i) => i !== index));
  }

  // Vacía todo el carrito
  removeAllBoletas() {
    this.carritoSubject.next([]);
  }
}