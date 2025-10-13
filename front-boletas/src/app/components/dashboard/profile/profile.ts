import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonaService } from '../../../services/persona';
import { PersonaDTO } from '../../../models/persona.model';

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

  usuario: PersonaDTO | null = null;
  cargando = true;
  error = '';

  ngOnInit() {
    // Puedes cambiar el DNI por el del usuario autenticado
    this.personaService.getPersonaPorDni('20701633').subscribe({
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