import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../enviroments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  // Helper para obtener headers con token JWT
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  // Listar todos los usuarios
  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(
      this.apiUrl,
      { headers: this.getAuthHeaders() }
    );
  }

  // Actualizar datos de usuario (admin o usuario propio)
  actualizarUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${this.apiUrl}/${id}`,
      usuario,
      { headers: this.getAuthHeaders() }
    );
  }

  // Eliminar usuario (solo admin)
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Cambiar estado de usuario (permitir acceso)
  cambiarEstado(id: number, estado: boolean): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${this.apiUrl}/${id}/estado`,
      estado,
      { headers: this.getAuthHeaders() }
    );
  }

  // Cambiar contraseña (admin o usuario dueño)
  cambiarContrasena(id: number, nuevaContrasena: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${id}/contrasena`,
      nuevaContrasena,
      { headers: this.getAuthHeaders() }
    );
  }
}