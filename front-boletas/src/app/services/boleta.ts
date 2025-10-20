import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoletaDTO } from '../models/boleta.model';
import { environment } from '../../enviroments/environment';

@Injectable({ providedIn: 'root' })
export class BoletaService {
  private apiUrl = `${environment.apiUrl}/boletas`;

  constructor(private http: HttpClient) {}

  // Nota: El endpoint GET /boletas devuelve entidades Boleta (no DTO).
  // Si necesitas tipado fuerte, crea un modelo BoletaEntity según tu backend.
  listarBoletas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  listarBoletasPersona(personaId: number): Observable<BoletaDTO[]> {
    return this.http.get<BoletaDTO[]>(`${this.apiUrl}/${personaId}`);
  }

  subirBoletas(boletas: BoletaDTO[]): Observable<any> {
    return this.http.post<any>(this.apiUrl, boletas);
  }
}