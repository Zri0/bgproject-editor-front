import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { EditorConfig, Buff, Effect } from '../models/models';
import { mapBuffFromApi, mapEffectFromApi } from './api-mappers';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl = environment.apiUrl;
  private configCache$: Observable<EditorConfig> | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Get the full editor configuration
   * Combines buffs, effects and server configuration
   */
  getConfig(): Observable<EditorConfig> {
    if (!this.configCache$) {
      this.configCache$ = combineLatest([
        this.getBuffs(),
        this.getEffects()
      ]).pipe(
        map(([buffs, effects]) => ({
          availableLevels: this.getAvailableLevels(),
          availableRaces: this.getAvailableRaces(),
          availableBuffs: buffs,
          availableEffects: effects
        })),
        shareReplay(1)
      );
    }
    return this.configCache$;
  }

  /**
   * Get the list of available buffs
   */
  getBuffs(): Observable<Buff[]> {
    return this.http.get<any>(`${this.apiUrl}/buffs/`).pipe(
      map(response => {
        // Handle paginated responses
        const results = response.results ? response.results : response;
        return results.map(mapBuffFromApi);
      })
    );
  }

  /**
   * Get a specific buff
   */
  getBuff(id: number): Observable<Buff> {
    return this.http.get<any>(`${this.apiUrl}/buffs/${id}/`).pipe(map(mapBuffFromApi));
  }

  /**
   * Get the list of available effects
   */
  getEffects(): Observable<Effect[]> {
    return this.http.get<any>(`${this.apiUrl}/efectos/`).pipe(
      map(response => {
        // Handle paginated responses
        const results = response.results ? response.results : response;
        return results.map(mapEffectFromApi);
      })
    );
  }

  /**
   * Get a specific effect
   */
  getEffect(id: number): Observable<Effect> {
    return this.http.get<any>(`${this.apiUrl}/efectos/${id}/`).pipe(map(mapEffectFromApi));
  }

  /**
   * Get available levels
   * Hardcoded for now, may come from the server in the future
   */
  getAvailableLevels(): number[] {
    // TODO: Load from server configuration
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }

  /**
   * Get available races
   * Hardcoded for now, may come from the server in the future
   */
  getAvailableRaces(): string[] {
    // TODO: Load from server configuration
    return ['Human', 'Elf', 'Dwarf', 'Orc', 'Goblin', 'Dragon'];
  }

  /**
   * Clear the configuration cache
   */
  clearCache(): void {
    this.configCache$ = null;
  }
}
