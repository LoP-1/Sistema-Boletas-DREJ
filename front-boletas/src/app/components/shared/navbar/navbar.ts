import { Component } from '@angular/core';
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
  rol: string | null = null;
  menuOpen = false;

  constructor(private auth: AuthService) {
    this.rol = this.auth.getRol();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }
}