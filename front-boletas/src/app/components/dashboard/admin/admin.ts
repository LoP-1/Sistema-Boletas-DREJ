import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../../models/usuario.model';
import { AdminService } from '../../../services/admin';
import { UsuarioService } from '../../../services/usuario';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin implements OnInit {
  private adminService = inject(AdminService);
  private usuarioService = inject(UsuarioService);
  private cd = inject(ChangeDetectorRef);

  usuarios: Usuario[] = [];
  mensaje = '';
  cargando = false;

  // Edición
  editarId: number | null = null;
  editarData: Usuario = {} as Usuario;

  // Cambio de contraseña
  cambiarPassId: number | null = null;
  nuevaPass = '';

  // Filtros
  filtroTexto = '';
  soloPendientes = false;

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.adminService.listarUsuarios().subscribe({
      next: lista => {
        // Ordena: pendientes primero
        this.usuarios = (lista || []).sort((a, b) => {
          if (!a.estadoCuenta && b.estadoCuenta) return -1;
          if (a.estadoCuenta && !b.estadoCuenta) return 1;
          return 0;
        });
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.mensaje = 'Error cargando usuarios';
        this.cargando = false;
        this.cd.detectChanges();
      }
    });
  }

  get usuariosFiltrados(): Usuario[] {
    const texto = this.filtroTexto.trim().toLowerCase();
    return this.usuarios.filter(u => {
      const coincideTexto =
        !texto ||
        [u.nombre, u.apellido, u.correo, u.dni, u.telefono]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(texto));
      const coincidePendiente = !this.soloPendientes || !u.estadoCuenta;
      return coincideTexto && coincidePendiente;
    });
  }

  permitirAcceso(id: number) {
    this.adminService.cambiarEstadoUsuario(id, true).subscribe({
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
    this.adminService.cambiarEstadoUsuario(id, false).subscribe({
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
        this.nuevaPass = '';
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

  limpiarMensaje() {
    this.mensaje = '';
  }
}