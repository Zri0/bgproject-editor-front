import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CardService } from '../../services/card.service';
import { ConfigService } from '../../services/config.service';
import { Card, EditorConfig, EditorMode } from '../../models/models';
import { FormComponent } from '../form/form.component';
import { PreviewComponent } from '../preview/preview.component';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormComponent, PreviewComponent],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, OnDestroy {
  mode: EditorMode = 'create';
  cardId: number | null = null;
  card: Card | null = null;
  config: EditorConfig | null = null;
  loading = true;
  error: string | null = null;
  saving = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private cardService: CardService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    // Determine the mode (create or edit) from the route
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.mode = 'edit';
          this.cardId = parseInt(params['id'], 10);
        } else {
          this.mode = 'create';
          this.cardId = null;
        }
        this.initialize();
      });
  }

  /**
   * Initialize the editor by loading configuration and card (if editing)
   */
  private initialize(): void {
    this.loading = true;
    this.error = null;

    // Load configuration
    this.configService.getConfig()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config) => {
          this.config = config;

          // If editing, load the card
          if (this.mode === 'edit' && this.cardId) {
            this.loadCard();
          } else {
            // If creating, initialize with an empty card
            this.card = this.createEmptyCard();
            this.loading = false;
          }
        },
        error: (err) => {
          this.error = 'Error loading configuration: ' + err.message;
          this.loading = false;
        }
      });
  }

  /**
   * Load an existing card
   */
  private loadCard(): void {
    if (!this.cardId) return;

    this.cardService.getCard(this.cardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (card) => {
          this.card = card;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error loading card: ' + err.message;
          this.loading = false;
        }
      });
  }

  /**
   * Create an empty card for creation mode
   */
  private createEmptyCard(): Card {
    return {
      title: '',
      description: '',
      image: '',
      level: this.config?.availableLevels[0] || 1,
      races: [],
      attack: 0,
      health: 0,
      appliedBuffs: [],
      effects: []
    };
  }

  /**
   * Handle changes made in the form
   */
  onCardChanged(card: Card): void {
    this.card = card;
    this.cardService.setCurrentCard(card);
  }

  /**
   * Save the card
   */
  onSave(card: Card): void {
    if (!card.title || !card.image) {
      this.error = 'Please complete the required fields (title and image)';
      return;
    }

    this.saving = true;
    this.error = null;

    if (this.mode === 'create') {
      this.cardService.createCard(card)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (savedCard) => {
            this.card = savedCard;
            this.mode = 'edit';
            this.cardId = savedCard.id || null;
            this.saving = false;
            alert('Card created successfully!');
          },
          error: (err) => {
            this.error = 'Error creating card: ' + err.message;
            this.saving = false;
          }
        });
    } else if (this.mode === 'edit' && this.cardId) {
      this.cardService.updateCard(this.cardId, card)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedCard) => {
            this.card = updatedCard;
            this.saving = false;
            alert('Card updated successfully!');
          },
          error: (err) => {
            this.error = 'Error updating card: ' + err.message;
            this.saving = false;
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
