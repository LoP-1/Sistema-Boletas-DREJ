import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '../../../models/usuario.model';
import { AuthService } from '../../../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  // Importamos CommonModule y FormsModule para usar ngModel y ngIf en la plantilla.
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  // Nota: Angular usa "styleUrls" (plural). Si tienes un error, cámbialo a styleUrls: ['./login.css']
  styleUrl: './login.css'
})
export class Login {
  // Estado del componente
  modoRegistro = false;        // false = mostrar login, true = mostrar formulario de registro
  mensaje = '';                // mensaje que se muestra en las alertas emergentes
  cargando = false;            // indica si hay una operación en curso (login/registro)
  correo = '';                 // modelo para el campo correo en el login
  contrasena = '';             // modelo para el campo contraseña en el login
  showEmergente = false;       // controla la visibilidad de la alerta de éxito
  showEmergenteError = false;  // controla la visibilidad de la alerta de error
  showGuia = false;            // controla la visibilidad del modal/guía

  // Datos del formulario de registro (inicializados vacíos)
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
    private auth: AuthService,           // servicio para autenticación (login / registro)
    private router: Router,              // para navegar tras el login
    private cd: ChangeDetectorRef       // para forzar detección de cambios en ciertos casos
  ) {}

  // Alterna entre modo login y modo registro. Limpia mensajes.
  alternarModo() {
    this.modoRegistro = !this.modoRegistro;
    this.mensaje = '';
  }

  // Muestra una alerta de éxito con el mensaje dado durante 4 segundos.
  mostrarEmergente(msj: string) {
    this.mensaje = msj;
    this.showEmergente = true;
    this.cd.detectChanges(); // fuerza actualización de la vista
    setTimeout(() => {
      this.showEmergente = false;
      this.cd.detectChanges();
    }, 4000);
  }

  // Muestra una alerta de error con el mensaje dado durante 4 segundos.
  mostrarEmergenteError(msj: string) {
    this.mensaje = msj;
    this.showEmergenteError = true;
    this.cd.detectChanges();
    setTimeout(() => {
      this.showEmergenteError = false;
      this.cd.detectChanges();
    }, 4000);
  }

  // Abre la guía (modal)
  abrirGuia() {
    this.showGuia = true;
    this.cd.detectChanges();
  }

  // Cierra la guía (modal)
  cerrarGuia() {
    this.showGuia = false;
    this.cd.detectChanges();
  }

  // Método de login:
  // - muestra el indicador de carga
  // - llama a auth.login(correo, contrasena)
  // - si tiene éxito guarda el token y navega al dashboard
  // - si hay error muestra la alerta de error con el mensaje recibido
  login() {
    this.cargando = true;
    this.auth.login(this.correo, this.contrasena).subscribe({
      next: token => {
        this.auth.saveToken(token);                 // guarda token en el servicio (o storage)
        this.cargando = false;
        this.mostrarEmergente('¡Login exitoso!');
        setTimeout(() => this.router.navigate(['/dashboard']), 700); // pequeña espera visual
      },
      error: err => {
        this.cargando = false;
        // intenta extraer un mensaje útil del error; si no existe, usa texto por defecto
        const errorMsg = err.error?.message || err.error || 'Credenciales incorrectas';
        this.mostrarEmergenteError(errorMsg);
      }
    });
  }

  // Método de registro:
  // - muestra indicador de carga
  // - llama a auth.registro(registroData)
  // - si tiene éxito resetea el formulario, cambia a modo login y muestra mensaje
  // - si hay error muestra alerta de error
  registro() {
    this.cargando = true;
    this.auth.registro(this.registroData).subscribe({
      next: usuario => {
        this.modoRegistro = false; // volver al login tras registro
        this.cargando = false;
        // limpiar datos del formulario de registro
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