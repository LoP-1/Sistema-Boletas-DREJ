import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonaDTO } from '../../../models/persona.model';
import { BoletaDTO } from '../../../models/boleta.model';
import { PersonaService } from '../../../services/persona';
import { BoletaService } from '../../../services/boleta';
import { FormsModule } from '@angular/forms';
import { BoletaDetalle } from '../boleta-detalle/boleta-detalle';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule,FormsModule,BoletaDetalle],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
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
      this.personaService.obtenerPersonaPorDni(dni).subscribe({
        next: (persona) => {
          this.persona = persona;
          this.cd.detectChanges();
          if (persona && persona.id != null) {
            this.boletaService.listarBoletasPersona(persona.id).subscribe({
              next: (boletas) => {
                const ordenadas = boletas
                  .filter(b => !!b.mes && !!b.anio)
                  .sort((a, b) => {
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