import { describe, expect, it } from 'vitest';
import { ConfigService } from '../../src/core/application/ConfigService';

describe('ConfigService', () => {
  it('clamps out-of-range numeric values to their constraints', () => {
    const service = new ConfigService();

    const validated = service.validate({ depth: 99, angle: -5, lengthFactor: 5 });

    expect(validated.depth).toBe(12);
    expect(validated.angle).toBe(1);
    expect(validated.lengthFactor).toBe(0.9);
  });

  it('fills in defaults for omitted fields', () => {
    const service = new ConfigService();

    const validated = service.validate({ depth: 5 });

    expect(validated.depth).toBe(5);
    expect(validated.angle).toBe(30);
    expect(validated.colors).toEqual({ trunk: '#8B4513', leaf: '#228B22', accent: '#FF69B4' });
  });

  it('returns independent copies from getDefaults so callers cannot mutate shared state', () => {
    const service = new ConfigService();

    const first = service.getDefaults();
    first.colors.trunk = '#000000';
    const second = service.getDefaults();

    expect(second.colors.trunk).toBe('#8B4513');
  });
});
