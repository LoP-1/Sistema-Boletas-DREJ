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
  // Servicios inyectados usando la API `inject()` (alternativa a constructor)
  private adminService = inject(AdminService);
  private usuarioService = inject(UsuarioService);
  private cd = inject(ChangeDetectorRef);

  // Estado del componente
  usuarios: Usuario[] = [];         // lista completa de usuarios
  mensaje = '';                     // mensaje informativo mostrado en la UI
  cargando = false;                 // indicador global de carga

  // Edición inline
  editarId: number | null = null;   // id del usuario que se está editando (null = no editar)
  editarData: Usuario = {} as Usuario; // datos temporales para la edición

  // Cambio de contraseña (modal)
  cambiarPassId: number | null = null; // id del usuario para cambiar contraseña
  nuevaPass = '';                      // nueva contraseña temporal

  // Filtros de la tabla
  filtroTexto = '';     // texto para búsqueda (nombre, correo, dni, teléfono)
  soloPendientes = false; // si true, muestra solo cuentas pendientes

  // ngOnInit: carga usuarios al inicializar el componente
  ngOnInit() {
    this.cargarUsuarios();
  }

  // Carga usuarios desde el servidor y ordena poniendo pendientes primero
  cargarUsuarios() {
    this.cargando = true;
    this.adminService.listarUsuarios().subscribe({
      next: lista => {
        // Orden sencillo: pendientes (estadoCuenta falsy) primero
        this.usuarios = (lista || []).sort((a, b) => {
          if (!a.estadoCuenta && b.estadoCuenta) return -1;
          if (a.estadoCuenta && !b.estadoCuenta) return 1;
          return 0;
        });
        this.cargando = false;
        this.cd.detectChanges(); // forzar detección de cambios tras actualizar datos
      },
      error: () => {
        this.mensaje = 'Error cargando usuarios';
        this.cargando = false;
        this.cd.detectChanges();
      }
    });
  }

  // Getter que aplica filtros en memoria (texto + estado pendiente)
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

  // Aprueba la cuenta de un usuario (cambia estado a true)
  permitirAcceso(id: number) {
    this.adminService.cambiarEstadoUsuario(id, true).subscribe({
      next: () => {
        this.mensaje = 'Acceso permitido';
        this.cargarUsuarios(); // recargar lista para reflejar cambio
        this.cd.detectChanges();
      },
      error: () => {
        this.mensaje = 'Error actualizando estado';
        this.cd.detectChanges();
      }
    });
  }

  // Revoca la cuenta de un usuario (cambia estado a false)
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

  // Inicia el modo edición para una fila y copia los datos a editarData
  mostrarEdicion(usuario: Usuario) {
    this.editarId = usuario.id!;
    this.editarData = { ...usuario }; // copia por valor para editar sin mutar original
    this.cd.detectChanges();
  }

  // Envía los cambios de edición al servidor
  guardarEdicion() {
    if (!this.editarId) return;
    this.usuarioService.actualizarUsuario(this.editarId, this.editarData).subscribe({
      next: () => {
        this.mensaje = 'Usuario actualizado';
        this.editarId = null;
        this.cargarUsuarios(); // recargar para mostrar datos actualizados
        this.cd.detectChanges();
      },
      error: () => {
        this.mensaje = 'Error actualizando usuario';
        this.cd.detectChanges();
      }
    });
  }

  // Cancela la edición (descarta cambios locales)
  cancelarEdicion() {
    this.editarId = null;
    this.cd.detectChanges();
  }

  // Abre el modal para cambiar contraseña y resetea el campo
  mostrarCambiarPass(id: number) {
    this.cambiarPassId = id;
    this.nuevaPass = '';
    this.cd.detectChanges();
  }

  // Envía la nueva contraseña para el usuario seleccionado
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

  // Cierra el modal de cambio de contraseña sin guardar
  cancelarCambioPass() {
    this.cambiarPassId = null;
    this.cd.detectChanges();
  }

  // Limpia el mensaje informativo (útil al interactuar con filtros)
  limpiarMensaje() {
    this.mensaje = '';
  }
}