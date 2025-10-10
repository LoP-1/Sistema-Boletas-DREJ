import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BoletaDTO } from '../models/boleta.model';

@Injectable({
  providedIn: 'root'
})
export class Carrito {
  private _carrito$ = new BehaviorSubject<BoletaDTO[]>(this.getLocalCarrito());
  public carrito$ = this._carrito$.asObservable();

  private getLocalCarrito(): BoletaDTO[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('carritoBoletas');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  }

  addBoleta(boleta: BoletaDTO) {
    const actual = this._carrito$.getValue();
    if (!actual.some(b => b.secuencia === boleta.secuencia)) {
      const nuevo = [...actual, boleta];
      this._carrito$.next(nuevo);
      localStorage.setItem('carritoBoletas', JSON.stringify(nuevo));
    }
  }

  removeBoleta(index: number) {
    const actual = [...this._carrito$.getValue()];
    actual.splice(index, 1);
    this._carrito$.next(actual);
    localStorage.setItem('carritoBoletas', JSON.stringify(actual));
  }

  removeAllBoletas() {
    this._carrito$.next([]);
    localStorage.removeItem('carritoBoletas');
  }
}