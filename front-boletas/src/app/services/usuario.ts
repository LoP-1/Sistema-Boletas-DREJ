import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../enviroments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private tokenKey = 'jwtToken';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.tokenKey);
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  // Registro
  registrar(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/registro`, usuario);
  }

  // Login: guarda el token en localStorage
  login(correo: string, contrasena: string): Observable<string> {
    const body = { correo, contrasena } as Partial<Usuario>;
    return this.http.post(`${this.apiUrl}/login`, body, { responseType: 'text' }).pipe(
      tap((token: string) => {
        if (token) {
          localStorage.setItem(this.tokenKey, token);
        }
      })
    );
  }

  // Actualizar datos del usuario (propietario o admin)
  actualizarUsuario(id: number, usuarioActualizado: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${this.apiUrl}/${id}`,
      usuarioActualizado,
      { headers: this.getAuthHeaders() }
    );
  }

  // Cambiar contraseña (propietario o admin)
  cambiarContrasena(id: number, nuevaContrasena: string): Observable<string> {
    // El backend espera un string plano en el body
    return this.http.put(`${this.apiUrl}/${id}/contrasena`, nuevaContrasena, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }

  // Helpers de autenticación
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

getUsuarioPorId(id: number): Observable<Usuario> {
  return this.http.get<Usuario>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
}

}