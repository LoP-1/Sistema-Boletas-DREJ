import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PersonaDTO } from '../models/persona.model';
import { environment } from '../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {
  private apiUrl = `${environment.apiUrl}/persona`;

  constructor(private http: HttpClient) { }

  getPersonaPorDni(dni: string): Observable<PersonaDTO> {
    return this.http.get<PersonaDTO>(`${this.apiUrl}/${dni}`);
  }
}