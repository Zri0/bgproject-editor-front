import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../models/models';

/**
 * Battlegrounds-style card visual (frame, art, tier, name, attack, health).
 * Shared between the editor preview and the card list thumbnails so both
 * render the exact same look.
 */
@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.css']
})
export class GameCardComponent implements OnDestroy {
  @Input() card!: Card;

  private cachedFile: File | null = null;
  private cachedUrl: string | null = null;

  /**
   * Image to show: a local object URL while the user has a file pending upload,
   * otherwise the stored URL served by the backend.
   */
  get imageSrc(): string | null {
    const file = this.card?.imageFile ?? null;
    if (file) {
      if (file !== this.cachedFile) {
        this.revoke();
        this.cachedUrl = URL.createObjectURL(file);
        this.cachedFile = file;
      }
      return this.cachedUrl;
    }
    this.revoke();
    return this.card?.image ?? null;
  }

  private revoke(): void {
    if (this.cachedUrl) {
      URL.revokeObjectURL(this.cachedUrl);
      this.cachedUrl = null;
      this.cachedFile = null;
    }
  }

  ngOnDestroy(): void {
    this.revoke();
  }
}
