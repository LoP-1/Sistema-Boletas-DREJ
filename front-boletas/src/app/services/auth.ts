import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../enviroments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private tokenKey = 'jwtToken';

  constructor(private http: HttpClient) {}

  login(correo: string, contrasena: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/login`, { correo, contrasena }, { responseType: 'text' });
  }

  registro(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/registro`, usuario);
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    try {
      const payload = this.decodeJwt(token);
      if (payload) {
        const id = payload.uid ?? payload.id ?? payload.userId ?? payload.user_id ?? null;
        if (id != null) localStorage.setItem('userId', String(id));

        if (payload.dni) localStorage.setItem('userDni', String(payload.dni));
        if (payload.nombre) localStorage.setItem('userNombre', payload.nombre);
        if (payload.apellido) localStorage.setItem('userApellido', payload.apellido);
        if (payload.sub) localStorage.setItem('userCorreo', payload.sub);
        if (payload.telefono) localStorage.setItem('userTelefono', payload.telefono);
        if (payload.rol) localStorage.setItem('userRol', payload.rol);
      }
    } catch {
      // Ignorar errores de decodificación
    }
  }

  getToken(): string | null { return localStorage.getItem(this.tokenKey); }
  logout(): void { localStorage.removeItem(this.tokenKey); }

  getDni(): string | null { return localStorage.getItem('userDni'); }
  getUserId(): number | null { const v = localStorage.getItem('userId'); return v ? Number(v) : null; }
  getNombre(): string | null { return localStorage.getItem('userNombre'); }
  getApellido(): string | null { return localStorage.getItem('userApellido'); }
  getCorreo(): string | null { return localStorage.getItem('userCorreo'); }
  getTelefono(): string | null { return localStorage.getItem('userTelefono'); }
  getRol(): string | null { return localStorage.getItem('userRol'); }

  private decodeJwt(token: string): any | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(payload)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  }
}