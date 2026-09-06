import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Card, CardAppliedBuff, CardContainedEffect, Parameters } from '../models/models';
import {
  mapAppliedBuffFromApi,
  mapCardFromApi,
  mapCardToApi,
  mapContainedEffectFromApi,
  mapParametersForApi
} from './api-mappers';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = `${environment.apiUrl}/cards`;
  private currentCard$ = new BehaviorSubject<Card | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Observable of the card currently being edited
   */
  getCurrentCard$(): Observable<Card | null> {
    return this.currentCard$.asObservable();
  }

  /**
   * Get the list of all cards (paginated)
   */
  listCards(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/?page=${page}`);
  }

  /**
   * Get the full detail of a card by ID
   */
  getCard(id: number): Observable<Card> {
    return this.http.get<any>(`${this.apiUrl}/${id}/`).pipe(map(mapCardFromApi));
  }

  /**
   * Create a new card
   */
  createCard(card: Card): Observable<Card> {
    return this.http.post<any>(this.apiUrl + '/', mapCardToApi(card)).pipe(map(mapCardFromApi));
  }

  /**
   * Update an existing card
   */
  updateCard(id: number, card: Partial<Card>): Observable<Card> {
    return this.http.put<any>(`${this.apiUrl}/${id}/`, mapCardToApi(card)).pipe(map(mapCardFromApi));
  }

  /**
   * Delete a card
   */
  deleteCard(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }

  /**
   * Add a buff to a card
   */
  addBuff(cardId: number, buffId: number, parameters: Parameters): Observable<CardAppliedBuff> {
    return this.http.post<any>(
      `${this.apiUrl}/${cardId}/add-buff/`,
      { buff: buffId, parameters: mapParametersForApi(parameters) }
    ).pipe(map(mapAppliedBuffFromApi));
  }

  /**
   * Remove a buff from a card
   */
  removeBuff(cardId: number, buffId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cardId}/remove-buff/${buffId}/`);
  }

  /**
   * Add an effect to a card
   */
  addEffect(cardId: number, effectId: number, parameters: Parameters): Observable<CardContainedEffect> {
    return this.http.post<any>(
      `${this.apiUrl}/${cardId}/add-effect/`,
      { effect: effectId, parameters: mapParametersForApi(parameters) }
    ).pipe(map(mapContainedEffectFromApi));
  }

  /**
   * Remove an effect from a card
   */
  removeEffect(cardId: number, effectId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cardId}/remove-effect/${effectId}/`);
  }

  /**
   * Update the current card in the editor
   */
  setCurrentCard(card: Card): void {
    this.currentCard$.next(card);
  }

  /**
   * Clear the current card
   */
  clearCurrentCard(): void {
    this.currentCard$.next(null);
  }
}
