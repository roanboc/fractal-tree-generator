import { describe, expect, it } from 'vitest';
import { ConfigService } from '../../src/core/application/ConfigService';

describe('ConfigService', () => {
  it('clamps out-of-range numeric values to their constraints', () => {
    const service = new ConfigService();

    const validated = service.validate({ depth: 99, angle: -5, lengthFactor: 5 });

    expect(validated.depth).toEqual({ min: 12, max: 12 });
    expect(validated.angle).toEqual({ min: 1, max: 1 });
    expect(validated.lengthFactor).toEqual({ min: 0.9, max: 0.9 });
  });

  it('normalizes single numbers into fixed intervals', () => {
    const service = new ConfigService();

    const validated = service.validate({ depth: 7, angle: 30 });

    expect(validated.depth).toEqual({ min: 7, max: 7 });
    expect(validated.angle).toEqual({ min: 30, max: 30 });
  });

  it('accepts interval inputs and clamps both ends', () => {
    const service = new ConfigService();

    const validated = service.validate({
      depth: { min: 0, max: 99 },
      angle: { min: 20, max: 40 },
    });

    expect(validated.depth).toEqual({ min: 1, max: 12 });
    expect(validated.angle).toEqual({ min: 20, max: 40 });
  });

  it('swaps inverted intervals so min never exceeds max', () => {
    const service = new ConfigService();

    const validated = service.validate({ angle: { min: 40, max: 20 } });

    expect(validated.angle).toEqual({ min: 20, max: 40 });
  });

  it('fills in defaults for omitted fields', () => {
    const service = new ConfigService();

    const validated = service.validate({ depth: 5 });

    expect(validated.depth).toEqual({ min: 5, max: 5 });
    expect(validated.angle).toEqual({ min: 18, max: 34 });
    expect(validated.colors).toEqual({ trunk: '#a86a33', leaf: '#34d399', accent: '#fbbf24' });
  });

  it('clamps scalar fields like strokeDuration and randomness', () => {
    const service = new ConfigService();

    const validated = service.validate({ strokeDuration: 99999, randomness: -1 });

    expect(validated.strokeDuration).toBe(2000);
    expect(validated.randomness).toBe(0);
  });

  it('returns independent copies from getDefaults so callers cannot mutate shared state', () => {
    const service = new ConfigService();

    const first = service.getDefaults();
    first.colors.trunk = '#000000';
    first.depth.min = 1;
    const second = service.getDefaults();

    expect(second.colors.trunk).toBe('#a86a33');
    expect(second.depth.min).toBe(6);
  });
});
