import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card, EditorConfig } from '../../models/models';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnDestroy {
  @Input() card!: Card;
  @Input() config: EditorConfig | null = null;

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

  /**
   * Resolve a race id to its name using the expanded races on the card or the config
   */
  raceName(raceId: number): string {
    const fromCard = this.card?.racesDetail?.find(r => r.id === raceId);
    if (fromCard) return fromCard.name;
    const fromConfig = this.config?.availableRaces.find(r => r.id === raceId);
    return fromConfig?.name || `Race #${raceId}`;
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
