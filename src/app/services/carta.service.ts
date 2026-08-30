import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Carta, CartaBuffAplicado, CartaEfectoContenido, Parametros } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CartaService {
  private apiUrl = `${environment.apiUrl}/cartas`;
  private cartaActual$ = new BehaviorSubject<Carta | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Observable de la carta actual en edición
   */
  getCartaActual$(): Observable<Carta | null> {
    return this.cartaActual$.asObservable();
  }

  /**
   * Obtener lista de todas las cartas (con paginación)
   */
  listarCartas(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/?page=${page}`);
  }

  /**
   * Obtener detalle completo de una carta por ID
   */
  obtenerCarta(id: number): Observable<Carta> {
    return this.http.get<Carta>(`${this.apiUrl}/${id}/`);
  }

  /**
   * Crear una nueva carta
   */
  crearCarta(carta: Carta): Observable<Carta> {
    return this.http.post<Carta>(this.apiUrl + '/', carta);
  }

  /**
   * Actualizar una carta existente
   */
  actualizarCarta(id: number, carta: Partial<Carta>): Observable<Carta> {
    return this.http.put<Carta>(`${this.apiUrl}/${id}/`, carta);
  }

  /**
   * Eliminar una carta
   */
  eliminarCarta(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }

  /**
   * Agregar un buff a una carta
   */
  agregarBuff(cartaId: number, buffId: number, parametros: Parametros): Observable<CartaBuffAplicado> {
    return this.http.post<CartaBuffAplicado>(
      `${this.apiUrl}/${cartaId}/add-buff/`,
      { buff: buffId, parametros }
    );
  }

  /**
   * Remover un buff de una carta
   */
  removerBuff(cartaId: number, buffId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cartaId}/remove-buff/${buffId}/`);
  }

  /**
   * Agregar un efecto a una carta
   */
  agregarEfecto(cartaId: number, efectoId: number, parametros: Parametros): Observable<CartaEfectoContenido> {
    return this.http.post<CartaEfectoContenido>(
      `${this.apiUrl}/${cartaId}/add-efecto/`,
      { efecto: efectoId, parametros }
    );
  }

  /**
   * Remover un efecto de una carta
   */
  removerEfecto(cartaId: number, efectoId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cartaId}/remove-efecto/${efectoId}/`);
  }

  /**
   * Actualizar la carta actual en el editor
   */
  setCartaActual(carta: Carta): void {
    this.cartaActual$.next(carta);
  }

  /**
   * Limpiar la carta actual
   */
  limpiarCartaActual(): void {
    this.cartaActual$.next(null);
  }
}
