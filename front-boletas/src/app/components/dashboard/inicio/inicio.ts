import { Component, OnInit } from '@angular/core';
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
    private boletaService: BoletaService
  ) {}

  ngOnInit(): void {
    //const dni = localStorage.getItem('dni');
    //const idStr = localStorage.getItem('id');
    //const id = idStr ? Number(idStr) : null;
    const dni = '20701633';
    const id = 3030; 

   
    if (dni) {
      this.personaService.getPersonaPorDni(dni).subscribe({
        next: (persona) => { this.persona = persona; }
      });
    }
    if (id !== null) {
      this.boletaService.getBoletasPorPersonaId(id).subscribe({
        next: (boletas) => {
          const ordenadas = boletas.sort((a, b) => {
            const dateA = Number(a.anio) * 100 + Number(a.mes);
            const dateB = Number(b.anio) * 100 + Number(b.mes);
            return dateB - dateA;
          });
          this.boletasRecientes = ordenadas.slice(0, 3);
        }
      });
    }
  }

  verDetalle(boleta: BoletaDTO) {
    this.modalBoleta = boleta;
  }
  closeModal() {
    this.modalBoleta = null;
  }
}