/**
 * Mapping layer between the backend API shape (Spanish field names) and the
 * app's internal English domain models (see models.ts). The backend contract
 * itself is out of scope here, so all translation happens at this boundary.
 */
import { Attribute, Buff, Card, CardAppliedBuff, CardContainedEffect, Effect, Parameters } from '../models/models';

interface ApiAttribute {
  nombre: string;
  tipo: 'entero' | 'string' | 'booleano' | 'decimal';
}

interface ApiBuff {
  id: number;
  name: string;
  description: string;
  atributos: ApiAttribute[];
  created_at?: string;
  updated_at?: string;
}

interface ApiEffect {
  id: number;
  name: string;
  description: string;
  atributos: ApiAttribute[];
  created_at?: string;
  updated_at?: string;
}

type ApiParameters = Record<string, any>;

interface ApiCardAppliedBuff {
  id: number;
  buff: number;
  buff_detail?: ApiBuff;
  parametros: ApiParameters;
  created_at?: string;
  updated_at?: string;
}

interface ApiCardContainedEffect {
  id: number;
  efecto: number;
  efecto_detail?: ApiEffect;
  parametros: ApiParameters;
  created_at?: string;
  updated_at?: string;
}

interface ApiCard {
  id?: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  nivel: number;
  razas: string[];
  ataque: number;
  vida: number;
  buffs_aplicados?: ApiCardAppliedBuff[];
  efectos?: ApiCardContainedEffect[];
  created_at?: string;
  updated_at?: string;
}

const attributeTypeFromApi: Record<ApiAttribute['tipo'], Attribute['type']> = {
  entero: 'integer',
  string: 'string',
  booleano: 'boolean',
  decimal: 'decimal'
};

const attributeTypeToApi: Record<Attribute['type'], ApiAttribute['tipo']> = {
  integer: 'entero',
  string: 'string',
  boolean: 'booleano',
  decimal: 'decimal'
};

export function mapAttributeFromApi(api: ApiAttribute): Attribute {
  return { name: api.nombre, type: attributeTypeFromApi[api.tipo] };
}

export function mapAttributeToApi(attribute: Attribute): ApiAttribute {
  return { nombre: attribute.name, tipo: attributeTypeToApi[attribute.type] };
}

export function mapBuffFromApi(api: ApiBuff): Buff {
  return {
    id: api.id,
    name: api.name,
    description: api.description,
    attributes: (api.atributos || []).map(mapAttributeFromApi),
    createdAt: api.created_at,
    updatedAt: api.updated_at
  };
}

export function mapEffectFromApi(api: ApiEffect): Effect {
  return {
    id: api.id,
    name: api.name,
    description: api.description,
    attributes: (api.atributos || []).map(mapAttributeFromApi),
    createdAt: api.created_at,
    updatedAt: api.updated_at
  };
}

function mapParametersFromApi(parametros: ApiParameters): Parameters {
  return { ...parametros };
}

function mapParametersToApi(parameters: Parameters): ApiParameters {
  return { ...parameters };
}

export function mapAppliedBuffFromApi(api: ApiCardAppliedBuff): CardAppliedBuff {
  return {
    id: api.id,
    buff: api.buff,
    buffDetail: api.buff_detail ? mapBuffFromApi(api.buff_detail) : undefined,
    parameters: mapParametersFromApi(api.parametros),
    createdAt: api.created_at,
    updatedAt: api.updated_at
  };
}

export function mapContainedEffectFromApi(api: ApiCardContainedEffect): CardContainedEffect {
  return {
    id: api.id,
    effect: api.efecto,
    effectDetail: api.efecto_detail ? mapEffectFromApi(api.efecto_detail) : undefined,
    parameters: mapParametersFromApi(api.parametros),
    createdAt: api.created_at,
    updatedAt: api.updated_at
  };
}

export function mapCardFromApi(api: ApiCard): Card {
  return {
    id: api.id,
    title: api.titulo,
    description: api.descripcion,
    image: api.imagen,
    level: api.nivel,
    races: api.razas,
    attack: api.ataque,
    health: api.vida,
    appliedBuffs: (api.buffs_aplicados || []).map(mapAppliedBuffFromApi),
    effects: (api.efectos || []).map(mapContainedEffectFromApi),
    createdAt: api.created_at,
    updatedAt: api.updated_at
  };
}

export function mapCardToApi(card: Partial<Card>): Partial<ApiCard> {
  const api: Partial<ApiCard> = {};
  if (card.id !== undefined) api.id = card.id;
  if (card.title !== undefined) api.titulo = card.title;
  if (card.description !== undefined) api.descripcion = card.description;
  if (card.image !== undefined) api.imagen = card.image;
  if (card.level !== undefined) api.nivel = card.level;
  if (card.races !== undefined) api.razas = card.races;
  if (card.attack !== undefined) api.ataque = card.attack;
  if (card.health !== undefined) api.vida = card.health;
  return api;
}

export function mapParametersForApi(parameters: Parameters): ApiParameters {
  return mapParametersToApi(parameters);
}
