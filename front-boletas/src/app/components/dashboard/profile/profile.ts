import { ChangeDetectorRef, Component, NgModule, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../../services/usuario';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private usuarioService = inject(UsuarioService);
  private auth = inject(AuthService);

  usuario: any = null;
  cargando = true;
  error = '';
  nuevaContrasena = '';
  mensajePass = '';

  ngOnInit() {
    const dni = this.auth.getDni();
    if (!dni) {
      this.error = 'No se encontró el usuario autenticado.';
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuario = usuarios.find(u => u.dni === dni);
        if (!this.usuario) {
          this.error = 'No se encontró el usuario en la base de datos.';
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar el perfil.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  actualizarUsuario() {
    if (!this.usuario || !this.usuario.id) return;
    this.cargando = true;
    this.usuarioService.actualizarUsuario(this.usuario.id, this.usuario).subscribe({
      next: (res) => {
        this.usuario = res;
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
    if (!this.usuario || !this.usuario.id) return ;
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
  
}