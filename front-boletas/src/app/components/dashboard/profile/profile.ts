import { ChangeDetectorRef, Component, NgModule, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonaService } from '../../../services/persona';
import { PersonaDTO } from '../../../models/persona.model';
import { AuthService } from '../../../services/auth';
import { UsuarioService } from '../../../services/usuario';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {

  
  private cdr = inject(ChangeDetectorRef);
  private personaService = inject(PersonaService);
  private auth = inject(AuthService);

  usuario: PersonaDTO | null = null;
  cargando = true;
  error = '';
  nuevaContrasena = '';
  mensajePass = '';

  ngOnInit() {
    const dni = this.auth.getDni();
    if (!dni) {
      this.error = 'No se encontró el usuario autenticado.';
      this.cargando = false;
      return;
    }

    this.personaService.getPersonaPorDni(dni).subscribe({
      next: (persona) => {
        this.usuario = persona;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.error = 'No se pudo cargar el perfil.';
        this.cargando = false;
      }
    });
  }
  constructor(private usuarioService: UsuarioService) {}
  cambiarContrasena() {
    if (!this.usuario || !this.usuario.id) return;
    this.cargando = true;
    this.usuarioService.cambiarContrasena(this.usuario.id, this.nuevaContrasena).subscribe({
      next: () => {
        this.mensajePass = '¡Contraseña actualizada!';
        this.nuevaContrasena = '';
        this.cargando = false;
      },
      error: () => {
        this.mensajePass = 'Error al cambiar la contraseña';
        this.cargando = false;
      }
    });
  }
}