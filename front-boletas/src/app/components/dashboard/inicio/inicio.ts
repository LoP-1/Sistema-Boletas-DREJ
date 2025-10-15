import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PersonaDTO } from '../../../models/persona.model';
import { BoletaDTO } from '../../../models/boleta.model';
import { PersonaService } from '../../../services/persona';
import { BoletaService } from '../../../services/boleta';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit {
  persona: PersonaDTO | null = null;
  boletasRecientes: BoletaDTO[] = [];
  modalBoleta: BoletaDTO | null = null;

  constructor(
    private personaService: PersonaService,
    private boletaService: BoletaService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const dni = localStorage.getItem('userDni');

    if (dni) {
      this.personaService.getPersonaPorDni(dni).subscribe({
        next: (persona) => {
          this.persona = persona;
          this.cd.detectChanges(); 
          if (persona && persona.id) {
            this.boletaService.getBoletasPorPersonaId(persona.id).subscribe({
              next: (boletas) => {
                const ordenadas = boletas.sort((a, b) => {
                  const dateA = Number(a.anio) * 100 + Number(a.mes);
                  const dateB = Number(b.anio) * 100 + Number(b.mes);
                  return dateB - dateA;
                });
                this.boletasRecientes = ordenadas.slice(0, 3);
                this.cd.detectChanges();
              }
            });
          }
        }
      });
    }
  }

  verDetalle(boleta: BoletaDTO) {
    this.modalBoleta = boleta;
    this.cd.detectChanges();
  }
  closeModal() {
    this.modalBoleta = null;
    this.cd.detectChanges();
  }
}