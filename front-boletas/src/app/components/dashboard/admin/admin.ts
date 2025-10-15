import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Usuario } from '../../../models/usuario.model';
import { UsuarioService } from '../../../services/usuario';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  usuarios: Usuario[] = [];
  mensaje = '';
  cargando = false;
  editarId: number | null = null;
  editarData: Usuario = {} as Usuario;
  cambiarPassId: number | null = null;
  nuevaPass = '';

  constructor(private usuarioService: UsuarioService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.usuarioService.listarUsuarios().subscribe({
      next: lista => {
        this.usuarios = lista.sort((a, b) => {
          if (!a.estadoCuenta && b.estadoCuenta) return -1;
          if (a.estadoCuenta && !b.estadoCuenta) return 1;
          return 0;
        });
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: err => {
        this.mensaje = 'Error cargando usuarios';
        this.cargando = false;
        this.cd.detectChanges();
      }
    });
  }

  permitirAcceso(id: number) {
    this.usuarioService.cambiarEstado(id, true).subscribe({
      next: () => {
        this.mensaje = 'Acceso permitido';
        this.cargarUsuarios();
        this.cd.detectChanges();
      },
      error: () => {
        this.mensaje = 'Error actualizando estado';
        this.cd.detectChanges();
      }
    });
  }

  invalidarAcceso(id: number) {
    this.usuarioService.cambiarEstado(id, false).subscribe({
      next: () => {
        this.mensaje = 'Cuenta invalidada';
        this.cargarUsuarios();
        this.cd.detectChanges();
      },
      error: () => {
        this.mensaje = 'Error invalidando cuenta';
        this.cd.detectChanges();
      }
    });
  }

  mostrarEdicion(usuario: Usuario) {
    this.editarId = usuario.id!;
    this.editarData = { ...usuario };
    this.cd.detectChanges();
  }

  guardarEdicion() {
    if (!this.editarId) return;
    this.usuarioService.actualizarUsuario(this.editarId, this.editarData).subscribe({
      next: () => {
        this.mensaje = 'Usuario actualizado';
        this.editarId = null;
        this.cargarUsuarios();
        this.cd.detectChanges();
      },
      error: () => {
        this.mensaje = 'Error actualizando usuario';
        this.cd.detectChanges();
      }
    });
  }

  cancelarEdicion() {
    this.editarId = null;
    this.cd.detectChanges();
  }

  mostrarCambiarPass(id: number) {
    this.cambiarPassId = id;
    this.nuevaPass = '';
    this.cd.detectChanges();
  }

  guardarNuevaPass() {
    if (!this.cambiarPassId || !this.nuevaPass) return;
    this.usuarioService.cambiarContrasena(this.cambiarPassId, this.nuevaPass).subscribe({
      next: () => {
        this.mensaje = 'Contraseña cambiada';
        this.cambiarPassId = null;
        this.cd.detectChanges();
      },
      error: () => {
        this.mensaje = 'Error cambiando contraseña';
        this.cd.detectChanges();
      }
    });
  }

  cancelarCambioPass() {
    this.cambiarPassId = null;
    this.cd.detectChanges();
  }
}