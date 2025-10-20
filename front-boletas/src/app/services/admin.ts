import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoletaDTO } from '../models/boleta.model';
import { PersonaDTO } from '../models/persona.model';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../enviroments/environment';

export interface PageBoletaDTO {
  totalElements: number;
  totalPages: number;
  size: number;
  content: BoletaDTO[];
  number: number;
}

export interface PagePersonaDTO {
  totalElements: number;
  totalPages: number;
  size: number;
  content: PersonaDTO[];
  number: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  // ---- BOLETAS (ADMIN) ----
  listarBoletas(page: number = 0, size: number = 30): Observable<PageBoletaDTO> {
    return this.http.get<PageBoletaDTO>(
      `${this.apiUrl}/boletas?page=${page}&size=${size}`,
      { headers: this.getAuthHeaders() }
    );
  }

  listarBoletasPorPersona(personaId: number): Observable<BoletaDTO[]> {
    return this.http.get<BoletaDTO[]>(
      `${this.apiUrl}/boletas/persona/${personaId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  subirBoletas(boletas: BoletaDTO[]): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/boletas`,
      boletas,
      { headers: this.getAuthHeaders() }
    );
  }

  editarBoleta(id: number, boleta: BoletaDTO): Observable<BoletaDTO> {
    return this.http.put<BoletaDTO>(
      `${this.apiUrl}/boletas/${id}`,
      boleta,
      { headers: this.getAuthHeaders() }
    );
  }

  eliminarBoleta(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/boletas/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ---- PERSONAS (ADMIN) ----
  listarPersonas(page: number = 0, size: number = 30): Observable<PagePersonaDTO> {
    return this.http.get<PagePersonaDTO>(
      `${this.apiUrl}/personas?page=${page}&size=${size}`,
      { headers: this.getAuthHeaders() }
    );
  }

  crearPersona(persona: PersonaDTO): Observable<PersonaDTO> {
    return this.http.post<PersonaDTO>(
      `${this.apiUrl}/personas`,
      persona,
      { headers: this.getAuthHeaders() }
    );
  }

  editarPersona(id: number, persona: PersonaDTO): Observable<PersonaDTO> {
    return this.http.put<PersonaDTO>(
      `${this.apiUrl}/personas/${id}`,
      persona,
      { headers: this.getAuthHeaders() }
    );
  }

  eliminarPersona(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/personas/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ---- USUARIOS (ADMIN) ----
  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(
      `${this.apiUrl}/usuarios`,
      { headers: this.getAuthHeaders() }
    );
  }

  cambiarEstadoUsuario(id: number, nuevoEstado: boolean): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${this.apiUrl}/usuarios/${id}/estado`,
      nuevoEstado,
      { headers: this.getAuthHeaders() }
    );
  }
}