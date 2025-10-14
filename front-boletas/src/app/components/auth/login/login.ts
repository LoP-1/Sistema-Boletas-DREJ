import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '../../../models/usuario.model';
import { AuthService } from '../../../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports :[CommonModule,FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  modoRegistro = false;
  mensaje = '';
  cargando = false;

  // Login form
  correo = '';
  contrasena = '';

  // Registro form
  registroData: Usuario = {
    nombre: '',
    apellido: '',
    correo: '',
    dni: '',
    telefono: '',
    rol: 'USER',
    contrasena: ''
  };

  constructor(private auth: AuthService, private router: Router) {}

  alternarModo() {
    this.modoRegistro = !this.modoRegistro;
    this.mensaje = '';
  }

  login() {
    this.cargando = true;
    this.auth.login(this.correo, this.contrasena).subscribe({
      next: token => {
        this.auth.saveToken(token);
        this.mensaje = '¡Login exitoso!';
        this.cargando = false;
        setTimeout(() => this.router.navigate(['/dashboard']), 700);
      },
      error: err => {
        this.mensaje = err.error || 'Login falló';
        this.cargando = false;
      }
    });
  }

  registro() {
    this.cargando = true;
    this.auth.registro(this.registroData).subscribe({
      next: usuario => {
        this.mensaje = '¡Registro exitoso! Ahora inicia sesión.';
        this.modoRegistro = false;
        this.cargando = false;
        // Limpia campos
        this.registroData = {
          nombre: '',
          apellido: '',
          correo: '',
          dni: '',
          telefono: '',
          rol: 'USER',
          contrasena: ''
        };
      },
      error: err => {
        this.mensaje = err.error || 'Registro falló';
        this.cargando = false;
      }
    });
  }
}