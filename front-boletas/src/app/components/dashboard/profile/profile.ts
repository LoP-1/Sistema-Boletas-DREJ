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
  private cdr = inject(ChangeDetectorRef);
  private adminService = inject(AdminService);
  private usuarioService = inject(UsuarioService);
  private auth = inject(AuthService);
  private tourService = inject(TourService);
  private router = inject(Router);

  usuario: Usuario | null = null;
  cargando = true;
  error = '';
  nuevaContrasena = '';
  mensajePass = '';

  ngOnInit() {
    const dni = this.auth.getDni();
    const id = this.auth.getUserId();

    if (!dni || !id) {
      this.error = 'No se encontró el usuario autenticado.';
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    const rol = this.auth.getRol();

    if (rol === 'ADMIN') {
      this.adminService.listarUsuarios().subscribe({
        next: (usuarios) => {
          const encontrado = usuarios.find(u => u.dni === dni);
          if (encontrado) this.usuario = encontrado;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.usuarioService.getUsuarioPorId(id).subscribe({
        next: (usuario) => {
          this.usuario = usuario;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: () => {
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

  actualizarUsuario() {
    if (!this.usuario || !this.usuario.id) return;
    this.cargando = true;
    this.usuarioService.actualizarUsuario(this.usuario.id, this.usuario).subscribe({
      next: (res) => {
        this.usuario = res;
        if (res.correo) localStorage.setItem('userCorreo', res.correo);
        if (res.telefono) localStorage.setItem('userTelefono', res.telefono);
        this.mensajePass = '¡Datos actualizados!';
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajePass = 'Error al actualizar los datos';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarContrasena() {
    if (!this.usuario || !this.usuario.id) return;
    this.cargando = true;
    this.usuarioService.cambiarContrasena(this.usuario.id, this.nuevaContrasena).subscribe({
      next: () => {
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

  restartTour() {
    this.tourService.resetTour();
    this.router.navigate(['/dashboard/inicio']).then(() => {
      setTimeout(() => {
        this.tourService.startUserTour();
      }, 800);
    });
  }
}