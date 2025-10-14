import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/environment';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/usuarios`;
  private tokenKey = 'jwtToken';
  private dniKey = 'userDni';

  constructor(private http: HttpClient) {}

  login(correo: string, contrasena: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/login`, { correo, contrasena });
  }

  registro(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/registro`, usuario);
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    // También guarda el DNI extraído del token
    const dni = this.getDniFromToken(token);
    if (dni) localStorage.setItem(this.dniKey, dni);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.dniKey);
  }

  // Extraer el DNI del JWT (debe estar en los claims, asegúrate que el backend lo incluya)
  getDni(): string | null {
    return localStorage.getItem(this.dniKey);
  }

  private getDniFromToken(token: string): string | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace('-', '+').replace('_', '/')));
      return decoded.dni || null;
    } catch {
      return null;
    }
  }
}