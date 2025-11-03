import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  // Rol del usuario (se usa en la plantilla para mostrar/ocultar enlaces)
  rol: string | null = null;

  // Estado del menú móvil (abierto/cerrado)
  menuOpen = false;
  
  // Servicio de autenticación inyectado con inject()
  private auth = inject(AuthService);

  constructor() {
    // Al crear el componente, tomamos el rol desde el servicio auth
    this.rol = this.auth.getRol();
  }

  // Alterna el estado del menú móvil (abre/cierra)
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // Cierra el menú móvil (útil después de navegar)
  closeMenu() {
    this.menuOpen = false;
  }

  // Llama al método logout del servicio de autenticación
  logout() {
    this.auth.logout();
  }
}