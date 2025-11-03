import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../enviroments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  // Base URL para endpoints relacionados con usuarios
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private tokenKey = 'jwtToken';

  constructor(private http: HttpClient) {}

  // Construye headers con token JWT guardado en localStorage
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.tokenKey);
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  // ---- Registro / Login ----

  // Registra un usuario nuevo (POST /usuarios/registro)
  registrar(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/registro`, usuario);
  }

  // Login: envía credenciales y guarda el token recibido en localStorage
  // Se usa responseType: 'text' para recibir el JWT como texto plano
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

  // ---- Gestión de usuario ----

  // Actualiza datos del usuario (requiere autorización)
  actualizarUsuario(id: number, usuarioActualizado: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${this.apiUrl}/${id}`,
      usuarioActualizado,
      { headers: this.getAuthHeaders() }
    );
  }

  // Cambia la contraseña: el backend espera el nuevo password como body en texto plano
  cambiarContrasena(id: number, nuevaContrasena: string): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/contrasena`, nuevaContrasena, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }

  // ---- Helpers de autenticación local ----

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Obtener un usuario por id (requiere autorización)
  getUsuarioPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}