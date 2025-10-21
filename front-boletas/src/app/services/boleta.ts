import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoletaDTO } from '../models/boleta.model';
import { environment } from '../../enviroments/environment';

@Injectable({ providedIn: 'root' })
export class BoletaService {
  private apiUrl = `${environment.apiUrl}/boletas`;

  constructor(private http: HttpClient) {}

  // Listado general
  listarBoletas(): Observable<BoletaDTO[]> {
    return this.http.get<BoletaDTO[]>(this.apiUrl);
  }

  // Boletas por persona
  listarBoletasPersona(personaId: number): Observable<BoletaDTO[]> {
    return this.http.get<BoletaDTO[]>(`${this.apiUrl}/${personaId}`);
  }

  subirBoletasJson(boletas: BoletaDTO[]): Observable<any> {
  return this.http.post(this.apiUrl, boletas, { 
    responseType: 'text'
  });
}

  editarBoleta(id: number, boleta: BoletaDTO): Observable<BoletaDTO> {
    return this.http.put<BoletaDTO>(`${this.apiUrl}/${id}`, boleta);
  }

  eliminarBoleta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}