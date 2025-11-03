import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoletaDTO } from '../models/boleta.model';
import { environment } from '../../enviroments/environment';

@Injectable({ providedIn: 'root' })
export class BoletaService {
  // Base URL para endpoints relacionados con boletas
  private apiUrl = `${environment.apiUrl}/boletas`;

  constructor(private http: HttpClient) {}

  // Listado general de boletas (GET /boletas)
  listarBoletas(): Observable<BoletaDTO[]> {
    return this.http.get<BoletaDTO[]>(this.apiUrl);
  }

  // Obtener boletas asociadas a una persona (GET /boletas/{personaId})
  listarBoletasPersona(personaId: number): Observable<BoletaDTO[]> {
    return this.http.get<BoletaDTO[]>(`${this.apiUrl}/${personaId}`);
  }

  // Subir un arreglo de boletas en formato JSON al servidor (POST /boletas)
  // Aquí pedimos responseType: 'text' porque el backend puede devolver un mensaje simple en texto.
  subirBoletasJson(boletas: BoletaDTO[]): Observable<any> {
    return this.http.post(this.apiUrl, boletas, { 
      responseType: 'text'
    });
  }

  // Editar una boleta existente (PUT /boletas/{id})
  editarBoleta(id: number, boleta: BoletaDTO): Observable<BoletaDTO> {
    return this.http.put<BoletaDTO>(`${this.apiUrl}/${id}`, boleta);
  }

  // Eliminar una boleta por id (DELETE /boletas/{id})
  eliminarBoleta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}