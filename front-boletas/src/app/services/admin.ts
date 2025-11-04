import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoletaDTO } from '../models/boleta.model';
import { PersonaDTO } from '../models/persona.model';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../enviroments/environment';

// Páginas devueltas por la API (paginación estándar)
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
  // Base URL del backend para endpoints de admin
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Construye headers con el token JWT almacenado en localStorage
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  // ---- BOLETAS (ADMIN) ----

  // Listar boletas paginadas (para vista admin)
  listarBoletas(page: number = 0, size: number = 30): Observable<PageBoletaDTO> {
    return this.http.get<PageBoletaDTO>(
      `${this.apiUrl}/boletas?page=${page}&size=${size}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Obtener todas las boletas de una persona (sin paginar)
  listarBoletasPorPersona(personaId: number): Observable<BoletaDTO[]> {
    return this.http.get<BoletaDTO[]>(
      `${this.apiUrl}/boletas/persona/${personaId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Subir varias boletas (JSON) al endpoint de admin
  subirBoletas(boletas: BoletaDTO[]): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/boletas`,
      boletas,
      { headers: this.getAuthHeaders() }
    );
  }

  // Editar una boleta por id
  editarBoleta(id: number, boleta: BoletaDTO): Observable<BoletaDTO> {
    return this.http.put<BoletaDTO>(
      `${this.apiUrl}/boletas/${id}`,
      boleta,
      { headers: this.getAuthHeaders() }
    );
  }

  // Eliminar boleta por id
  eliminarBoleta(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/boletas/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ---- PERSONAS (ADMIN) ----

  // Listar personas paginadas
  listarPersonas(): Observable<PagePersonaDTO> {
    return this.http.get<PagePersonaDTO>(
      `${this.apiUrl}/personas`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Crear una nueva persona
  crearPersona(persona: PersonaDTO): Observable<PersonaDTO> {
    return this.http.post<PersonaDTO>(
      `${this.apiUrl}/personas`,
      persona,
      { headers: this.getAuthHeaders() }
    );
  }

  // Editar persona por id
  editarPersona(id: number, persona: PersonaDTO): Observable<PersonaDTO> {
    return this.http.put<PersonaDTO>(
      `${this.apiUrl}/personas/${id}`,
      persona,
      { headers: this.getAuthHeaders() }
    );
  }

  // Eliminar persona por id
  eliminarPersona(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/personas/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ---- USUARIOS (ADMIN) ----

  // Listar todos los usuarios (usado por admin)
  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(
      `${this.apiUrl}/usuarios`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Cambiar estado (activar/desactivar) de un usuario
  cambiarEstadoUsuario(id: number, nuevoEstado: boolean): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${this.apiUrl}/usuarios/${id}/estado`,
      nuevoEstado,
      { headers: this.getAuthHeaders() }
    );
  }
}