/**
 * Modelos de datos para la aplicación de edición de cartas
 */

/**
 * Atributo: Estructura nombre-tipo que define qué parámetros puede tener
 */
export interface Atributo {
  nombre: string;
  tipo: 'entero' | 'string' | 'booleano' | 'decimal';
}

/**
 * Buff: Mejora que se puede aplicar a una carta
 */
export interface Buff {
  id: number;
  name: string;
  description: string;
  atributos: Atributo[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Efecto: Condición/efecto que puede estar contenido en una carta
 */
export interface Efecto {
  id: number;
  name: string;
  description: string;
  atributos: Atributo[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Parámetros: Valores específicos para una instancia de Buff/Efecto
 * Ej: {"hp": 10, "attack": 5}
 */
export type Parametros = Record<string, any>;

/**
 * CartaBuffAplicado: Relación de Buff aplicado a una Carta
 */
export interface CartaBuffAplicado {
  id: number;
  buff: number;
  buff_detail?: Buff;
  parametros: Parametros;
  created_at?: string;
  updated_at?: string;
}

/**
 * CartaEfectoContenido: Relación de Efecto contenido en una Carta
 */
export interface CartaEfectoContenido {
  id: number;
  efecto: number;
  efecto_detail?: Efecto;
  parametros: Parametros;
  created_at?: string;
  updated_at?: string;
}

/**
 * Carta: Entidad principal - la carta de juego a editar
 */
export interface Carta {
  id?: number;
  titulo: string;
  descripcion: string;
  imagen: string; // URL
  nivel: number;
  razas: string[]; // Array de razas
  ataque: number;
  vida: number;
  buffs_aplicados?: CartaBuffAplicado[];
  efectos?: CartaEfectoContenido[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Configuración cargada del backend
 */
export interface EditorConfig {
  nivelesDisponibles: number[];
  razasDisponibles: string[];
  buffsDisponibles: Buff[];
  efectosDisponibles: Efecto[];
}

/**
 * Modo del editor
 */
export type EditorMode = 'create' | 'edit';
