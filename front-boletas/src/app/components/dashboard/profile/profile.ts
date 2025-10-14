import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonaService } from '../../../services/persona';
import { PersonaDTO } from '../../../models/persona.model';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
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
}