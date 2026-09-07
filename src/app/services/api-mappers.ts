/**
 * Mapping layer between the backend API payloads and the app's internal domain
 * models (see models.ts). The backend speaks English `snake_case`; this boundary
 * translates casing and nesting, and turns card writes into `multipart/form-data`
 * so the uploaded `image` file travels with the rest of the fields.
 */
import { environment } from '../../environments/environment';
import { Attribute, Buff, Card, CardAppliedBuff, CardContainedEffect, Effect, Parameters, Race } from '../models/models';

/**
 * Normalize the image path returned by the API. Responses usually carry an
 * absolute URL, but a relative `/media/...` path (or a bare filename) is
 * resolved against the API origin so the `<img>` still loads.
 */
function resolveImageUrl(image: string | null | undefined): string | null {
  if (!image) return null;
  if (/^(https?:)?\/\//i.test(image) || image.startsWith('data:') || image.startsWith('blob:')) {
    return image;
  }
  try {
    return new URL(image, new URL(environment.apiUrl).origin).href;
  } catch {
    return image;
  }
}

interface ApiAttribute {
  name: string;
  type: 'integer' | 'string' | 'boolean' | 'decimal';
}

interface ApiBuff {
  id: number;
  name: string;
  description: string;
  attributes: ApiAttribute[];
  created_at?: string;
  updated_at?: string;
}

interface ApiEffect {
  id: number;
  name: string;
  description: string;
  attributes: ApiAttribute[];
  created_at?: string;
  updated_at?: string;
}

interface ApiRace {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

type ApiParameters = Record<string, any>;

interface ApiCardAppliedBuff {
  id: number;
  buff: number;
  buff_detail?: ApiBuff;
  parameters: ApiParameters;
  created_at?: string;
  updated_at?: string;
}

interface ApiCardContainedEffect {
  id: number;
  effect: number;
  effect_detail?: ApiEffect;
  parameters: ApiParameters;
  created_at?: string;
  updated_at?: string;
}

interface ApiCard {
  id?: number;
  title: string;
  description: string;
  image: string | null;
  level: number;
  races: number[];
  races_detail?: ApiRace[];
  attack: number;
  health: number;
  applied_buffs?: ApiCardAppliedBuff[];
  effects?: ApiCardContainedEffect[];
  created_at?: string;
  updated_at?: string;
}

export function mapAttributeFromApi(api: ApiAttribute): Attribute {
  return { name: api.name, type: api.type };
}

export function mapBuffFromApi(api: ApiBuff): Buff {
  return {
    id: api.id,
    name: api.name,
    description: api.description,
    attributes: (api.attributes || []).map(mapAttributeFromApi),
    createdAt: api.created_at,
    updatedAt: api.updated_at
  };
}

export function mapEffectFromApi(api: ApiEffect): Effect {
  return {
    id: api.id,
    name: api.name,
    description: api.description,
    attributes: (api.attributes || []).map(mapAttributeFromApi),
    createdAt: api.created_at,
    updatedAt: api.updated_at
  };
}

export function mapRaceFromApi(api: ApiRace): Race {
  return {
    id: api.id,
    name: api.name,
    description: api.description,
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
    parameters: mapParametersFromApi(api.parameters),
    createdAt: api.created_at,
    updatedAt: api.updated_at
  };
}

export function mapContainedEffectFromApi(api: ApiCardContainedEffect): CardContainedEffect {
  return {
    id: api.id,
    effect: api.effect,
    effectDetail: api.effect_detail ? mapEffectFromApi(api.effect_detail) : undefined,
    parameters: mapParametersFromApi(api.parameters),
    createdAt: api.created_at,
    updatedAt: api.updated_at
  };
}

export function mapCardFromApi(api: ApiCard): Card {
  return {
    id: api.id,
    title: api.title,
    description: api.description ?? '',
    image: resolveImageUrl(api.image),
    level: api.level,
    races: api.races ?? [],
    racesDetail: (api.races_detail || []).map(mapRaceFromApi),
    attack: api.attack,
    health: api.health,
    appliedBuffs: (api.applied_buffs || []).map(mapAppliedBuffFromApi),
    effects: (api.effects || []).map(mapContainedEffectFromApi),
    createdAt: api.created_at,
    updatedAt: api.updated_at
  };
}

/**
 * Build the `multipart/form-data` body for creating/updating a card.
 *
 * `image` is appended only when the user picked a new file; omitting it keeps
 * the current file on `PUT`/`PATCH` (see the backend README). `races` is sent as
 * one repeated field per id, which is how the API reads the many-to-many.
 */
export function mapCardToFormData(card: Partial<Card>): FormData {
  const form = new FormData();
  if (card.title !== undefined) form.append('title', card.title);
  if (card.description !== undefined) form.append('description', card.description ?? '');
  if (card.level !== undefined) form.append('level', String(card.level));
  if (card.attack !== undefined) form.append('attack', String(card.attack));
  if (card.health !== undefined) form.append('health', String(card.health));
  if (card.races !== undefined) {
    card.races.forEach(raceId => form.append('races', String(raceId)));
  }
  if (card.imageFile) {
    form.append('image', card.imageFile);
  }
  return form;
}

export function mapParametersForApi(parameters: Parameters): ApiParameters {
  return mapParametersToApi(parameters);
}
