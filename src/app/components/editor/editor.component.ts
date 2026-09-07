import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
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
  warning: string | null = null;
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
    this.warning = null;

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
      image: null,
      imageFile: null,
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
    if (!card.title) {
      this.error = 'Please complete the required field: title';
      return;
    }

    if (this.mode === 'create' && !card.imageFile) {
      this.error = 'Please choose an image file to upload';
      return;
    }

    this.saving = true;
    this.error = null;
    this.warning = null;

    const wasCreate = this.mode === 'create';
    const write$: Observable<Card> = wasCreate
      ? this.cardService.createCard(card)
      : this.cardService.updateCard(this.cardId!, card);

    write$
      .pipe(
        // The write endpoints answer with a trimmed body; re-read the full
        // representation so the editor always reflects what was actually stored.
        switchMap(saved => {
          const id = saved.id ?? this.cardId;
          return id ? this.cardService.getCard(id) : of(saved);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (serverCard) => {
          this.card = this.reconcile(card, serverCard);
          this.mode = 'edit';
          this.cardId = this.card.id ?? null;
          this.saving = false;
          if (!this.warning) {
            alert(wasCreate ? 'Card created successfully!' : 'Card updated successfully!');
          }
        },
        error: (err) => {
          this.error = `Error ${wasCreate ? 'creating' : 'updating'} card: ` + err.message;
          this.saving = false;
        }
      });
  }

  /**
   * Reconcile the submitted card with the server's stored representation.
   *
   * `id`, the stored image URL, expanded relationships and timestamps are taken
   * from the server. If the server dropped fields the user filled in (the write
   * serializer currently ignores `races`), those local values are kept so the
   * work is not lost and a warning is raised.
   */
  private reconcile(submitted: Card, server: Card): Card {
    const droppedRaces = submitted.races.length > 0 && server.races.length === 0;

    const dropped: string[] = [];
    if (droppedRaces) dropped.push('races');
    this.warning = dropped.length
      ? `Saved, but the backend did not persist: ${dropped.join(', ')}. `
        + 'These values are shown from your input and will be lost on reload.'
      : null;

    return {
      ...server,
      imageFile: null,
      races: droppedRaces ? submitted.races : server.races,
      racesDetail: droppedRaces ? submitted.racesDetail : server.racesDetail
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
