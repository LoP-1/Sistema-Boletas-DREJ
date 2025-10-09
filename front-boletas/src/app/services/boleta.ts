import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoletaDTO } from '../models/boleta.model';
import { environment } from '../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class BoletaService {
  private apiUrl = `${environment.apiUrl}/boletas`;

  constructor(private http: HttpClient) { }

  // Todas las boletas de una persona por id
  getBoletasPorPersonaId(id: number): Observable<BoletaDTO[]> {
    return this.http.get<BoletaDTO[]>(`${this.apiUrl}/${id}`);
  }

  // Todas las boletas (index)
  getBoletas(): Observable<BoletaDTO[]> {
    return this.http.get<BoletaDTO[]>(this.apiUrl);
  }

  // Subir boletas (si es necesario)
  subirBoletas(boletas: BoletaDTO[]): Observable<string> {
    return this.http.post<string>(this.apiUrl, boletas);
  }
}