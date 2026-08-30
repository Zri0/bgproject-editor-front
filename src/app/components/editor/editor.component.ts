import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartaService } from '../../services/carta.service';
import { ConfigService } from '../../services/config.service';
import { Carta, EditorConfig, EditorMode } from '../../models/models';
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
  cartaId: number | null = null;
  carta: Carta | null = null;
  config: EditorConfig | null = null;
  loading = true;
  error: string | null = null;
  guardando = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private cartaService: CartaService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    // Determinar el modo (create o edit) desde la ruta
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.mode = 'edit';
          this.cartaId = parseInt(params['id'], 10);
        } else {
          this.mode = 'create';
          this.cartaId = null;
        }
        this.inicializar();
      });
  }

  /**
   * Inicializar el editor cargando configuración y carta (si es edición)
   */
  private inicializar(): void {
    this.loading = true;
    this.error = null;

    // Cargar configuración
    this.configService.obtenerConfig()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config) => {
          this.config = config;
          
          // Si es edición, cargar la carta
          if (this.mode === 'edit' && this.cartaId) {
            this.cargarCarta();
          } else {
            // Si es creación, inicializar con carta vacía
            this.carta = this.crearCartaVacia();
            this.loading = false;
          }
        },
        error: (err) => {
          this.error = 'Error al cargar la configuración: ' + err.message;
          this.loading = false;
        }
      });
  }

  /**
   * Cargar carta existente
   */
  private cargarCarta(): void {
    if (!this.cartaId) return;

    this.cartaService.obtenerCarta(this.cartaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (carta) => {
          this.carta = carta;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar la carta: ' + err.message;
          this.loading = false;
        }
      });
  }

  /**
   * Crear una carta vacía para el modo creación
   */
  private crearCartaVacia(): Carta {
    return {
      titulo: '',
      descripcion: '',
      imagen: '',
      nivel: this.config?.nivelesDisponibles[0] || 1,
      razas: [],
      ataque: 0,
      vida: 0,
      buffs_aplicados: [],
      efectos: []
    };
  }

  /**
   * Manejar cambios en el formulario
   */
  onCartaChanged(carta: Carta): void {
    this.carta = carta;
    this.cartaService.setCartaActual(carta);
  }

  /**
   * Guardar la carta
   */
  onGuardar(carta: Carta): void {
    if (!carta.titulo || !carta.imagen) {
      this.error = 'Por favor completa los campos requeridos (título e imagen)';
      return;
    }

    this.guardando = true;
    this.error = null;

    if (this.mode === 'create') {
      this.cartaService.crearCarta(carta)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (cartaGuardada) => {
            this.carta = cartaGuardada;
            this.mode = 'edit';
            this.cartaId = cartaGuardada.id || null;
            this.guardando = false;
            alert('¡Carta creada exitosamente!');
          },
          error: (err) => {
            this.error = 'Error al crear la carta: ' + err.message;
            this.guardando = false;
          }
        });
    } else if (this.mode === 'edit' && this.cartaId) {
      this.cartaService.actualizarCarta(this.cartaId, carta)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (cartaActualizada) => {
            this.carta = cartaActualizada;
            this.guardando = false;
            alert('¡Carta actualizada exitosamente!');
          },
          error: (err) => {
            this.error = 'Error al actualizar la carta: ' + err.message;
            this.guardando = false;
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
