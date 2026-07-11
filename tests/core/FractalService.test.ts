import { describe, expect, it, vi } from 'vitest';
import { FractalService } from '../../src/core/application/FractalService';
import { ConfigService } from '../../src/core/application/ConfigService';
import { SpeedControlService } from '../../src/core/application/SpeedControlService';
import { sampleInterval } from '../../src/core/application/math';
import { IRendererService } from '../../src/core/ports';

function createRendererSpy(): IRendererService {
  return {
    initialize: vi.fn(),
    drawBranch: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn(),
  };
}

const COLORS = { trunk: '#a86a33', leaf: '#34d399', accent: '#fbbf24' };

describe('FractalService', () => {
  it('draws 2^depth - 1 branches for a full binary tree', async () => {
    const renderer = createRendererSpy();
    const service = new FractalService(renderer, new SpeedControlService(), new ConfigService());

    const result = await service.generate({
      depth: 3,
      angle: 30,
      lengthFactor: 0.7,
      trunkLength: 120,
      lineWidth: 4,
      colors: COLORS,
      randomness: 0,
      animationSpeed: 0,
    });

    expect(result.totalBranchesDrawn).toBe(7); // 2^3 - 1
    expect(renderer.drawBranch).toHaveBeenCalledTimes(7);
  });

  it('uses the midpoint of the depth interval when wildness is zero', async () => {
    const renderer = createRendererSpy();
    const service = new FractalService(renderer, new SpeedControlService(), new ConfigService());

    const result = await service.generate({
      depth: { min: 2, max: 4 },
      randomness: 0,
    });

    // midpoint 3 → full binary tree of depth 3
    expect(result.totalBranchesDrawn).toBe(7);
  });

  it('keeps every branch tip inside the depth interval at full wildness', async () => {
    const renderer = createRendererSpy();
    const service = new FractalService(renderer, new SpeedControlService(), new ConfigService());

    const result = await service.generate({
      depth: { min: 2, max: 4 },
      randomness: 1,
    });

    // At least the depth-2 skeleton (3 sticks), at most a full depth-4 tree (15).
    expect(result.totalBranchesDrawn).toBeGreaterThanOrEqual(3);
    expect(result.totalBranchesDrawn).toBeLessThanOrEqual(15);
  });

  it('initializes the renderer with the default canvas dimensions before drawing', async () => {
    const renderer = createRendererSpy();
    const service = new FractalService(renderer, new SpeedControlService(), new ConfigService());

    await service.generate({ depth: 1, randomness: 0 });

    expect(renderer.initialize).toHaveBeenCalledWith({
      width: 800,
      height: 600,
      backgroundColor: '#1a1a2e',
    });
  });

  it('honors an injected canvas config and starts the trunk at its bottom-center', async () => {
    const renderer = createRendererSpy();
    const canvasConfig = { width: 240, height: 210, backgroundColor: '#0b1020' };
    const service = new FractalService(
      renderer,
      new SpeedControlService(),
      new ConfigService(),
      canvasConfig
    );

    await service.generate({ depth: 1, trunkLength: 50, randomness: 0 });

    expect(renderer.initialize).toHaveBeenCalledWith(canvasConfig);
    expect(renderer.drawBranch).toHaveBeenCalledWith(
      120, // width / 2
      210, // height (bottom edge)
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      expect.any(String),
      expect.any(Number) // strokeDuration
    );
  });

  it('delegates clear() to the renderer', () => {
    const renderer = createRendererSpy();
    const service = new FractalService(renderer, new SpeedControlService(), new ConfigService());

    service.clear();

    expect(renderer.clear).toHaveBeenCalledOnce();
  });
});

describe('sampleInterval', () => {
  it('returns the midpoint when wildness is zero', () => {
    expect(sampleInterval({ min: 10, max: 30 }, 0)).toBe(20);
  });

  it('stays inside the interval at full wildness', () => {
    for (let i = 0; i < 200; i++) {
      const v = sampleInterval({ min: 10, max: 30 }, 1);
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThanOrEqual(30);
    }
  });

  it('scales the spread around the midpoint with wildness', () => {
    // wildness 0.5 over [0, 100] must stay within [25, 75]
    for (let i = 0; i < 200; i++) {
      const v = sampleInterval({ min: 0, max: 100 }, 0.5);
      expect(v).toBeGreaterThanOrEqual(25);
      expect(v).toBeLessThanOrEqual(75);
    }
  });
});
