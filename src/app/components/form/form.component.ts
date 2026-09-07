import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card, EditorConfig, CardAppliedBuff, CardContainedEffect, Parameters, Buff, Effect, Race } from '../../models/models';
import { CardService } from '../../services/card.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  @Input() card!: Card;
  @Input() config!: EditorConfig;
  @Input() saving = false;
  @Output() cardChanged = new EventEmitter<Card>();
  @Output() save = new EventEmitter<Card>();

  selectedBuff: number | null = null;
  selectedEffect: number | null = null;
  tempBuffParameters: Parameters = {};
  tempEffectParameters: Parameters = {};

  constructor(private cardService: CardService) {}

  ngOnInit(): void {
    if (!this.card.appliedBuffs) {
      this.card.appliedBuffs = [];
    }
    if (!this.card.effects) {
      this.card.effects = [];
    }
  }

  /**
   * Emit changes to the card when the main fields change
   */
  onCardChange(): void {
    this.cardChanged.emit(this.card);
  }

  /**
   * Emit the save event
   */
  onSave(): void {
    this.save.emit(this.card);
  }

  /**
   * Store the file the user picked so it can be uploaded on save
   */
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    if (file) {
      this.card.imageFile = file;
      this.onCardChange();
    }
  }

  /**
   * Clear a pending image selection (keeps the card's current stored image)
   */
  clearImageSelection(input: HTMLInputElement): void {
    input.value = '';
    this.card.imageFile = null;
    this.onCardChange();
  }

  /**
   * Whether the given race is already assigned to the card
   */
  isRaceSelected(race: Race): boolean {
    return this.card.races.includes(race.id);
  }

  /**
   * Resolve a race id to its display name
   */
  raceName(raceId: number): string {
    const race = this.config.availableRaces.find(r => r.id === raceId);
    return race?.name || `Race #${raceId}`;
  }

  /**
   * Add a race to the card's race list
   */
  addRace(race: Race): void {
    if (!this.card.races.includes(race.id)) {
      this.card.races.push(race.id);
      this.onCardChange();
    }
  }

  /**
   * Remove a race from the list
   */
  removeRace(raceId: number): void {
    const index = this.card.races.indexOf(raceId);
    if (index >= 0) {
      this.card.races.splice(index, 1);
      this.onCardChange();
    }
  }

  /**
   * Get the selected Buff
   */
  get selectedBuffObj(): Buff | undefined {
    return this.config.availableBuffs.find(b => b.id === this.selectedBuff);
  }

  /**
   * Get the selected Effect
   */
  get selectedEffectObj(): Effect | undefined {
    return this.config.availableEffects.find(e => e.id === this.selectedEffect);
  }

  /**
   * Initialize temporary parameters when a buff is selected
   */
  onBuffSelected(): void {
    if (this.selectedBuff && this.selectedBuffObj) {
      this.tempBuffParameters = {};
      this.selectedBuffObj.attributes.forEach(attr => {
        this.tempBuffParameters[attr.name] = '';
      });
    }
  }

  /**
   * Initialize temporary parameters when an effect is selected
   */
  onEffectSelected(): void {
    if (this.selectedEffect && this.selectedEffectObj) {
      this.tempEffectParameters = {};
      this.selectedEffectObj.attributes.forEach(attr => {
        this.tempEffectParameters[attr.name] = '';
      });
    }
  }

  /**
   * Add a buff to the card
   */
  addBuff(): void {
    if (!this.selectedBuff || !this.card.id) {
      alert('Please save the card first');
      return;
    }

    this.cardService.addBuff(this.card.id, this.selectedBuff, this.tempBuffParameters)
      .subscribe({
        next: (appliedBuff) => {
          if (!this.card.appliedBuffs) {
            this.card.appliedBuffs = [];
          }
          this.card.appliedBuffs.push(appliedBuff);
          this.selectedBuff = null;
          this.tempBuffParameters = {};
          this.onCardChange();
        },
        error: (err) => alert('Error adding buff: ' + err.message)
      });
  }

  /**
   * Remove a buff from the card
   */
  removeBuff(appliedBuff: CardAppliedBuff): void {
    if (!this.card.id) return;

    this.cardService.removeBuff(this.card.id, appliedBuff.buff)
      .subscribe({
        next: () => {
          if (this.card.appliedBuffs) {
            const index = this.card.appliedBuffs.indexOf(appliedBuff);
            if (index >= 0) {
              this.card.appliedBuffs.splice(index, 1);
            }
          }
          this.onCardChange();
        },
        error: (err) => alert('Error removing buff: ' + err.message)
      });
  }

  /**
   * Add an effect to the card
   */
  addEffect(): void {
    if (!this.selectedEffect || !this.card.id) {
      alert('Please save the card first');
      return;
    }

    this.cardService.addEffect(this.card.id, this.selectedEffect, this.tempEffectParameters)
      .subscribe({
        next: (containedEffect) => {
          if (!this.card.effects) {
            this.card.effects = [];
          }
          this.card.effects.push(containedEffect);
          this.selectedEffect = null;
          this.tempEffectParameters = {};
          this.onCardChange();
        },
        error: (err) => alert('Error adding effect: ' + err.message)
      });
  }

  /**
   * Remove an effect from the card
   */
  removeEffect(containedEffect: CardContainedEffect): void {
    if (!this.card.id) return;

    this.cardService.removeEffect(this.card.id, containedEffect.effect)
      .subscribe({
        next: () => {
          if (this.card.effects) {
            const index = this.card.effects.indexOf(containedEffect);
            if (index >= 0) {
              this.card.effects.splice(index, 1);
            }
          }
          this.onCardChange();
        },
        error: (err) => alert('Error removing effect: ' + err.message)
      });
  }

  /**
   * Get the name of a buff by ID
   */
  getBuffName(buffId: number): string {
    const buff = this.config.availableBuffs.find(b => b.id === buffId);
    return buff?.name || 'Unknown';
  }

  /**
   * Get the name of an effect by ID
   */
  getEffectName(effectId: number): string {
    const effect = this.config.availableEffects.find(e => e.id === effectId);
    return effect?.name || 'Unknown';
  }
}
