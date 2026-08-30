import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Carta, EditorConfig, CartaBuffAplicado, CartaEfectoContenido, Parametros, Buff, Efecto } from '../../models/models';
import { CartaService } from '../../services/carta.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  @Input() carta!: Carta;
  @Input() config!: EditorConfig;
  @Input() guardando = false;
  @Output() cartaChanged = new EventEmitter<Carta>();
  @Output() guardar = new EventEmitter<Carta>();

  buffSeleccionado: number | null = null;
  efectoSeleccionado: number | null = null;
  parametrosTempBuff: Parametros = {};
  parametrosTempEfecto: Parametros = {};

  constructor(private cartaService: CartaService) {}

  ngOnInit(): void {
    if (!this.carta.buffs_aplicados) {
      this.carta.buffs_aplicados = [];
    }
    if (!this.carta.efectos) {
      this.carta.efectos = [];
    }
  }

  /**
   * Emitir cambios en la carta cuando cambian los campos principales
   */
  onCartaChange(): void {
    this.cartaChanged.emit(this.carta);
  }

  /**
   * Emitir evento guardar
   */
  onGuardar(): void {
    this.guardar.emit(this.carta);
  }

  /**
   * Agregar una raza a la lista de razas de la carta
   */
  agregarRaza(raza: string): void {
    if (raza && !this.carta.razas.includes(raza)) {
      this.carta.razas.push(raza);
      this.onCartaChange();
    }
  }

  /**
   * Remover una raza de la lista
   */
  removerRaza(raza: string): void {
    const index = this.carta.razas.indexOf(raza);
    if (index >= 0) {
      this.carta.razas.splice(index, 1);
      this.onCartaChange();
    }
  }

  /**
   * Obtener el Buff seleccionado
   */
  get buffSeleccionadoObj(): Buff | undefined {
    return this.config.buffsDisponibles.find(b => b.id === this.buffSeleccionado);
  }

  /**
   * Obtener el Efecto seleccionado
   */
  get efectoSeleccionadoObj(): Efecto | undefined {
    return this.config.efectosDisponibles.find(e => e.id === this.efectoSeleccionado);
  }

  /**
   * Inicializar parámetros temporales cuando se selecciona un buff
   */
  onBuffSeleccionado(): void {
    if (this.buffSeleccionado && this.buffSeleccionadoObj) {
      this.parametrosTempBuff = {};
      this.buffSeleccionadoObj.atributos.forEach(attr => {
        this.parametrosTempBuff[attr.nombre] = '';
      });
    }
  }

  /**
   * Inicializar parámetros temporales cuando se selecciona un efecto
   */
  onEfectoSeleccionado(): void {
    if (this.efectoSeleccionado && this.efectoSeleccionadoObj) {
      this.parametrosTempEfecto = {};
      this.efectoSeleccionadoObj.atributos.forEach(attr => {
        this.parametrosTempEfecto[attr.nombre] = '';
      });
    }
  }

  /**
   * Agregar un buff a la carta
   */
  agregarBuff(): void {
    if (!this.buffSeleccionado || !this.carta.id) {
      alert('Por favor guarda la carta primero');
      return;
    }

    this.cartaService.agregarBuff(this.carta.id, this.buffSeleccionado, this.parametrosTempBuff)
      .subscribe({
        next: (buffAplicado) => {
          if (!this.carta.buffs_aplicados) {
            this.carta.buffs_aplicados = [];
          }
          this.carta.buffs_aplicados.push(buffAplicado);
          this.buffSeleccionado = null;
          this.parametrosTempBuff = {};
          this.onCartaChange();
        },
        error: (err) => alert('Error al agregar buff: ' + err.message)
      });
  }

  /**
   * Remover un buff de la carta
   */
  removerBuff(buffAplicado: CartaBuffAplicado): void {
    if (!this.carta.id) return;

    this.cartaService.removerBuff(this.carta.id, buffAplicado.buff)
      .subscribe({
        next: () => {
          if (this.carta.buffs_aplicados) {
            const index = this.carta.buffs_aplicados.indexOf(buffAplicado);
            if (index >= 0) {
              this.carta.buffs_aplicados.splice(index, 1);
            }
          }
          this.onCartaChange();
        },
        error: (err) => alert('Error al remover buff: ' + err.message)
      });
  }

  /**
   * Agregar un efecto a la carta
   */
  agregarEfecto(): void {
    if (!this.efectoSeleccionado || !this.carta.id) {
      alert('Por favor guarda la carta primero');
      return;
    }

    this.cartaService.agregarEfecto(this.carta.id, this.efectoSeleccionado, this.parametrosTempEfecto)
      .subscribe({
        next: (efectoContenido) => {
          if (!this.carta.efectos) {
            this.carta.efectos = [];
          }
          this.carta.efectos.push(efectoContenido);
          this.efectoSeleccionado = null;
          this.parametrosTempEfecto = {};
          this.onCartaChange();
        },
        error: (err) => alert('Error al agregar efecto: ' + err.message)
      });
  }

  /**
   * Remover un efecto de la carta
   */
  removerEfecto(efectoContenido: CartaEfectoContenido): void {
    if (!this.carta.id) return;

    this.cartaService.removerEfecto(this.carta.id, efectoContenido.efecto)
      .subscribe({
        next: () => {
          if (this.carta.efectos) {
            const index = this.carta.efectos.indexOf(efectoContenido);
            if (index >= 0) {
              this.carta.efectos.splice(index, 1);
            }
          }
          this.onCartaChange();
        },
        error: (err) => alert('Error al remover efecto: ' + err.message)
      });
  }

  /**
   * Obtener el nombre de un buff por ID
   */
  getNombreBuff(buffId: number): string {
    const buff = this.config.buffsDisponibles.find(b => b.id === buffId);
    return buff?.name || 'Desconocido';
  }

  /**
   * Obtener el nombre de un efecto por ID
   */
  getNombreEfecto(efectoId: number): string {
    const efecto = this.config.efectosDisponibles.find(e => e.id === efectoId);
    return efecto?.name || 'Desconocido';
  }
}
