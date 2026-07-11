import { FractalParams } from '../domain/types';
import { IConfigService } from '../ports';
import { clamp } from './math';

const DEFAULTS: FractalParams = {
  depth: 7,
  angle: 30,
  lengthFactor: 0.7,
  trunkLength: 120,
  lineWidth: 4,
  colors: {
    trunk: '#8B4513',
    leaf: '#228B22',
    accent: '#FF69B4',
  },
  randomness: 0,
  animationSpeed: 0,
  showAccent: false,
};

const CONSTRAINTS: Record<string, { min: number; max: number }> = {
  depth: { min: 1, max: 12 },
  angle: { min: 1, max: 90 },
  lengthFactor: { min: 0.1, max: 0.9 },
  trunkLength: { min: 10, max: 500 },
  lineWidth: { min: 1, max: 20 },
  randomness: { min: 0, max: 1 },
  animationSpeed: { min: 0, max: 10000 },
};

export class ConfigService implements IConfigService {
  getDefaults(): FractalParams {
    return { ...DEFAULTS, colors: { ...DEFAULTS.colors } };
  }

  validate(params: Partial<FractalParams>): FractalParams {
    const merged = { ...this.getDefaults(), ...params };

    for (const [key, constraint] of Object.entries(CONSTRAINTS)) {
      const value = (merged as Record<string, unknown>)[key];
      if (typeof value === 'number') {
        (merged as Record<string, unknown>)[key] = clamp(value, constraint.min, constraint.max);
      }
    }

    if (params.colors) {
      merged.colors = { ...DEFAULTS.colors, ...params.colors };
    }

    return merged;
  }
}
