import { FractalParams, FractalParamsInput, Interval } from '../domain/types';
import { IConfigService } from '../ports';
import { clamp } from './math';

const DEFAULTS: FractalParams = {
  depth: { min: 6, max: 9 },
  angle: { min: 18, max: 34 },
  lengthFactor: { min: 0.65, max: 0.78 },
  trunkLength: 140,
  lineWidth: 10,
  colors: {
    trunk: '#a86a33',
    leaf: '#34d399',
    accent: '#fbbf24',
  },
  randomness: 0.5,
  animationSpeed: 0,
  strokeDuration: 0,
  showAccent: false,
};

type IntervalKey = 'depth' | 'angle' | 'lengthFactor';
type ScalarKey = 'trunkLength' | 'lineWidth' | 'randomness' | 'animationSpeed' | 'strokeDuration';

const INTERVAL_CONSTRAINTS: Record<IntervalKey, { min: number; max: number }> = {
  depth: { min: 1, max: 12 },
  angle: { min: 1, max: 90 },
  lengthFactor: { min: 0.1, max: 0.9 },
};

const SCALAR_CONSTRAINTS: Record<ScalarKey, { min: number; max: number }> = {
  trunkLength: { min: 10, max: 500 },
  lineWidth: { min: 1, max: 20 },
  randomness: { min: 0, max: 1 },
  animationSpeed: { min: 0, max: 10000 },
  strokeDuration: { min: 0, max: 2000 },
};

function normalizeInterval(
  value: number | Interval,
  constraint: { min: number; max: number }
): Interval {
  const raw: Interval = typeof value === 'number' ? { min: value, max: value } : value;
  const lo = clamp(Math.min(raw.min, raw.max), constraint.min, constraint.max);
  const hi = clamp(Math.max(raw.min, raw.max), constraint.min, constraint.max);
  return { min: lo, max: hi };
}

export class ConfigService implements IConfigService {
  getDefaults(): FractalParams {
    return {
      ...DEFAULTS,
      depth: { ...DEFAULTS.depth },
      angle: { ...DEFAULTS.angle },
      lengthFactor: { ...DEFAULTS.lengthFactor },
      colors: { ...DEFAULTS.colors },
    };
  }

  validate(params: FractalParamsInput): FractalParams {
    const merged = { ...this.getDefaults(), ...params } as FractalParams;

    for (const key of Object.keys(INTERVAL_CONSTRAINTS) as IntervalKey[]) {
      const value = params[key] ?? DEFAULTS[key];
      merged[key] = normalizeInterval(value, INTERVAL_CONSTRAINTS[key]);
    }

    for (const key of Object.keys(SCALAR_CONSTRAINTS) as ScalarKey[]) {
      const value = merged[key];
      if (typeof value === 'number') {
        merged[key] = clamp(value, SCALAR_CONSTRAINTS[key].min, SCALAR_CONSTRAINTS[key].max);
      }
    }

    if (params.colors) {
      merged.colors = { ...DEFAULTS.colors, ...params.colors };
    }

    return merged;
  }
}
