import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card, EditorConfig } from '../../models/models';
import { GameCardComponent } from '../game-card/game-card.component';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, GameCardComponent],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent {
  @Input() card!: Card;
  @Input() config: EditorConfig | null = null;

  /**
   * Resolve a race id to its name using the expanded races on the card or the config
   */
  raceName(raceId: number): string {
    const fromCard = this.card?.racesDetail?.find(r => r.id === raceId);
    if (fromCard) return fromCard.name;
    const fromConfig = this.config?.availableRaces.find(r => r.id === raceId);
    return fromConfig?.name || `Race #${raceId}`;
  }
}
