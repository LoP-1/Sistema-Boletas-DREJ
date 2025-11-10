import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from '../../../models/usuario.model';
import { AdminService } from '../../../services/admin';
import { UsuarioService } from '../../../services/usuario';
import { AuthService } from '../../../services/auth';
import { TourService } from '../../../services/tour';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  // Inyección por función `inject` para evitar constructor largo
  private cdr = inject(ChangeDetectorRef);
  private adminService = inject(AdminService);
  private usuarioService = inject(UsuarioService);
  private auth = inject(AuthService);
  private tourService = inject(TourService);
  private router = inject(Router);

  // Estado del componente
  usuario: Usuario | null = null; // usuario actualmente mostrado/editar
  cargando = true;                // indicador de carga para la UI
  error = '';                     // mensaje de error general
  nuevaContrasena = '';           // campo para nueva contraseña
  mensajePass = '';               // mensajes para la UI (éxito/error)

  // Al inicializar el componente, se busca el usuario autenticado
  ngOnInit() {
    const dni = this.auth.getDni();
    const id = this.auth.getUserId();

    // Si no hay datos de autenticación, mostrar error y salir
    if (!dni || !id) {
      this.error = 'No se encontró el usuario autenticado.';
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    const rol = this.auth.getRol();

    // Si es ADMIN, se lista todos los usuarios y se busca por DNI
    if (rol === 'ADMIN') {
      this.adminService.listarUsuarios().subscribe({
        next: (usuarios) => {
          const encontrado = usuarios.find(u => u.dni === dni);
          if (encontrado) this.usuario = encontrado;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          // En caso de error al listar usuarios, limpiar indicador de carga
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Para usuarios normales, se obtiene por id desde UsuarioService
      this.usuarioService.getUsuarioPorId(id).subscribe({
        next: (usuario) => {
          this.usuario = usuario;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          // Si falla la consulta, se construye un objeto básico desde el token/local
          this.usuario = {
            id,
            nombre: this.auth.getNombre() ?? '',
            apellido: this.auth.getApellido() ?? '',
            correo: this.auth.getCorreo() ?? '',
            dni: dni,
            telefono: this.auth.getTelefono() ?? '',
            rol: rol ?? 'USER',
            estadoCuenta: true
          };
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  // Actualiza los datos del usuario usando UsuarioService
  actualizarUsuario() {
    if (!this.usuario || !this.usuario.id) return;
    this.cargando = true;
    this.usuarioService.actualizarUsuario(this.usuario.id, this.usuario).subscribe({
      next: (res) => {
        // Actualizar local y persistir algunos campos en localStorage
        this.usuario = res;
        if (res.correo) localStorage.setItem('userCorreo', res.correo);
        if (res.telefono) localStorage.setItem('userTelefono', res.telefono);
        this.mensajePass = '¡Datos actualizados!';
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        // Manejo simple de error (se puede mejorar mostrando detalles)
        this.mensajePass = 'Error al actualizar los datos';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Cambia la contraseña del usuario actual
  cambiarContrasena() {
    if (!this.usuario || !this.usuario.id) return;
    this.cargando = true;
    this.usuarioService.cambiarContrasena(this.usuario.id, this.nuevaContrasena).subscribe({
      next: () => {
        // Éxito: limpiar campo y mostrar mensaje
        this.mensajePass = '¡Contraseña actualizada!';
        this.nuevaContrasena = '';
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajePass = 'Error al cambiar la contraseña';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Reinicia el tour de usuario y navega al inicio del dashboard antes de comenzarlo
  restartTour() {
    this.tourService.resetTour();
    this.router.navigate(['/dashboard/inicio']).then(() => {
      // Pequeña espera para asegurar que la vista esté lista antes de iniciar el tour
      setTimeout(() => {
        this.tourService.startUserTour();
      }, 800);
    });
  }
}