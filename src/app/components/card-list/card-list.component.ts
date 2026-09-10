import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CardService } from '../../services/card.service';
import { Card } from '../../models/models';
import { GameCardComponent } from '../game-card/game-card.component';

type ViewMode = 'grid' | 'list';

const VIEW_MODE_STORAGE_KEY = 'card-list.viewMode';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [CommonModule, RouterModule, GameCardComponent],
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.css']
})
export class CardListComponent implements OnInit, OnDestroy {
  cards: Card[] = [];
  loading = true;
  error: string | null = null;

  page = 1;
  count = 0;
  totalPages = 1;
  hasNext = false;
  hasPrevious = false;

  viewMode: ViewMode = 'grid';

  private pageSize: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(private cardService: CardService, private router: Router) {
    this.viewMode = this.loadViewMode();
  }

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading = true;
    this.error = null;

    this.cardService.listCards(page)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.cards = result.results;
          this.hasNext = !!result.next;
          this.hasPrevious = !!result.previous;
          this.page = page;
          this.count = result.count;

          // The API doesn't report its page size directly; infer it from a
          // full page (one followed by a next page) so total pages can be shown.
          if (result.results.length > 0 && (this.pageSize === null || result.next)) {
            this.pageSize = result.results.length;
          }
          this.totalPages = this.pageSize ? Math.max(1, Math.ceil(this.count / this.pageSize)) : 1;

          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error loading cards: ' + err.message;
          this.loading = false;
        }
      });
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page === this.page || page < 1 || page > this.totalPages) return;
    this.loadPage(page);
  }

  nextPage(): void {
    if (this.hasNext) this.loadPage(this.page + 1);
  }

  previousPage(): void {
    if (this.hasPrevious) this.loadPage(this.page - 1);
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // Ignore storage failures (e.g. private browsing) - view mode just won't persist.
    }
  }

  private loadViewMode(): ViewMode {
    try {
      const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      return stored === 'list' ? 'list' : 'grid';
    } catch {
      return 'grid';
    }
  }

  editCard(card: Card): void {
    this.router.navigate(['/editor'], { queryParams: { id: card.id } });
  }

  createCard(): void {
    this.router.navigate(['/editor']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
