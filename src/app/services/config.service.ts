import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { EditorConfig, Buff, Efecto } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl = environment.apiUrl;
  private configCache$: Observable<EditorConfig> | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Obtener la configuración completa del editor
   * Combina datos de buffs, efectos y configuración del servidor
   */
  obtenerConfig(): Observable<EditorConfig> {
    if (!this.configCache$) {
      this.configCache$ = combineLatest([
        this.obtenerBuffs(),
        this.obtenerEfectos()
      ]).pipe(
        map(([buffs, efectos]) => ({
          nivelesDisponibles: this.obtenerNivelesDisponibles(),
          razasDisponibles: this.obtenerRazasDisponibles(),
          buffsDisponibles: buffs,
          efectosDisponibles: efectos
        })),
        shareReplay(1)
      );
    }
    return this.configCache$;
  }

  /**
   * Obtener lista de buffs disponibles
   */
  obtenerBuffs(): Observable<Buff[]> {
    return this.http.get<any>(`${this.apiUrl}/buffs/`).pipe(
      map(response => {
        // Manejar si la respuesta es paginada
        return response.results ? response.results : response;
      })
    );
  }

  /**
   * Obtener un buff específico
   */
  obtenerBuff(id: number): Observable<Buff> {
    return this.http.get<Buff>(`${this.apiUrl}/buffs/${id}/`);
  }

  /**
   * Obtener lista de efectos disponibles
   */
  obtenerEfectos(): Observable<Efecto[]> {
    return this.http.get<any>(`${this.apiUrl}/efectos/`).pipe(
      map(response => {
        // Manejar si la respuesta es paginada
        return response.results ? response.results : response;
      })
    );
  }

  /**
   * Obtener un efecto específico
   */
  obtenerEfecto(id: number): Observable<Efecto> {
    return this.http.get<Efecto>(`${this.apiUrl}/efectos/${id}/`);
  }

  /**
   * Obtener niveles disponibles
   * Por ahora hardcodeado, puede venir del servidor en el futuro
   */
  obtenerNivelesDisponibles(): number[] {
    // TODO: Cargar desde configuración del servidor
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }

  /**
   * Obtener razas disponibles
   * Por ahora hardcodeado, puede venir del servidor en el futuro
   */
  obtenerRazasDisponibles(): string[] {
    // TODO: Cargar desde configuración del servidor
    return ['Human', 'Elf', 'Dwarf', 'Orc', 'Goblin', 'Dragon'];
  }

  /**
   * Limpiar el cache de configuración
   */
  limpiarCache(): void {
    this.configCache$ = null;
  }
}
