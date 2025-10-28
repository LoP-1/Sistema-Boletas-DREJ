import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '../../../models/usuario.model';
import { AuthService } from '../../../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  modoRegistro = false;
  mensaje = '';
  cargando = false;
  correo = '';
  contrasena = '';
  showEmergente = false;
  showEmergenteError = false;

  registroData: Usuario = {
    nombre: '',
    apellido: '',
    correo: '',
    dni: '',
    telefono: '',
    rol: 'USER',
    contrasena: ''
  };

  constructor(
    private auth: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
  }

  alternarModo() {
    this.modoRegistro = !this.modoRegistro;
    this.mensaje = '';
  }

  mostrarEmergente(msj: string) {
    this.mensaje = msj;
    this.showEmergente = true;
    this.cd.detectChanges();
    setTimeout(() => {
      this.showEmergente = false;
      this.cd.detectChanges();
    }, 4000);
  }

  mostrarEmergenteError(msj: string) {
    this.mensaje = msj;
    this.showEmergenteError = true;
    this.cd.detectChanges();
    setTimeout(() => {
      this.showEmergenteError = false;
      this.cd.detectChanges();
    }, 4000);
  }

  login() {
    this.cargando = true;
    this.auth.login(this.correo, this.contrasena).subscribe({
      next: token => {
        this.auth.saveToken(token);
        this.cargando = false;
        this.mostrarEmergente('¡Login exitoso!');
        setTimeout(() => this.router.navigate(['/dashboard']), 700);
      },
      error: err => {
        this.cargando = false;
        const errorMsg = err.error?.message || err.error || 'Credenciales incorrectas';
        this.mostrarEmergenteError(errorMsg);
      }
    });
  }

  registro() {
    this.cargando = true;
    this.auth.registro(this.registroData).subscribe({
      next: usuario => {
        this.modoRegistro = false;
        this.cargando = false;
        this.registroData = {
          nombre: '',
          apellido: '',
          correo: '',
          dni: '',
          telefono: '',
          rol: 'USER',
          contrasena: ''
        };
        this.mostrarEmergente('¡Registro exitoso! Su cuenta será revisada en breve.');
      },
      error: err => {
        this.cargando = false;
        const errorMsg = err.error?.message || err.error || 'Error en el registro';
        this.mostrarEmergenteError(errorMsg);
      }
    });
  }
}