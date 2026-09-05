/**
 * Data models for the card editing application
 */

/**
 * Attribute: name-type structure that defines what parameters an entity can have
 */
export interface Attribute {
  name: string;
  type: 'integer' | 'string' | 'boolean' | 'decimal';
}

/**
 * Buff: improvement that can be applied to a card
 */
export interface Buff {
  id: number;
  name: string;
  description: string;
  attributes: Attribute[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Effect: condition/effect that can be contained in a card
 */
export interface Effect {
  id: number;
  name: string;
  description: string;
  attributes: Attribute[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Parameters: specific values for a Buff/Effect instance
 * Ex: {"hp": 10, "attack": 5}
 */
export type Parameters = Record<string, any>;

/**
 * CardAppliedBuff: relationship of a Buff applied to a Card
 */
export interface CardAppliedBuff {
  id: number;
  buff: number;
  buffDetail?: Buff;
  parameters: Parameters;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * CardContainedEffect: relationship of an Effect contained in a Card
 */
export interface CardContainedEffect {
  id: number;
  effect: number;
  effectDetail?: Effect;
  parameters: Parameters;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Card: main entity - the game card being edited
 */
export interface Card {
  id?: number;
  title: string;
  description: string;
  image: string; // URL
  level: number;
  races: string[]; // Array of races
  attack: number;
  health: number;
  appliedBuffs?: CardAppliedBuff[];
  effects?: CardContainedEffect[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Configuration loaded from the backend
 */
export interface EditorConfig {
  availableLevels: number[];
  availableRaces: string[];
  availableBuffs: Buff[];
  availableEffects: Effect[];
}

/**
 * Editor mode
 */
export type EditorMode = 'create' | 'edit';
