import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/environment';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private tokenKey = 'jwtToken';
  private dniKey = 'userDni';
  private rolKey = 'userRol';

  constructor(private http: HttpClient) {}

  login(correo: string, contrasena: string): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/login`,
      { correo, contrasena },
      { responseType: 'text' }
    );
  }

  registro(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/registro`, usuario);
  }

  saveToken(token: string) {
  localStorage.setItem(this.tokenKey, token);
  const dni = this.getDniFromToken(token);
  if (dni) localStorage.setItem(this.dniKey, dni);
  const rol = this.getRolFromToken(token);
  if (rol) localStorage.setItem(this.rolKey, rol);
}

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.dniKey);
  }

  getDni(): string | null {
    return localStorage.getItem(this.dniKey);
  }

  private getDniFromToken(token: string): string | null {
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(base64));
      return decoded.dni || null;
    } catch {
      return null;
    }
  }

  getRol(): string | null {
  return localStorage.getItem(this.rolKey);
}

private getRolFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));
    return decoded.rol || null;
  } catch {
    return null;
  }
}

}