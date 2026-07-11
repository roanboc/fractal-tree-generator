import { describe, expect, it, vi } from 'vitest';
import { FractalService } from '../../src/core/application/FractalService';
import { ConfigService } from '../../src/core/application/ConfigService';
import { SpeedControlService } from '../../src/core/application/SpeedControlService';
import { IRendererService } from '../../src/core/ports';

function createRendererSpy(): IRendererService {
  return {
    initialize: vi.fn(),
    drawBranch: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn(),
  };
}

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
      colors: { trunk: '#8B4513', leaf: '#228B22', accent: '#FF69B4' },
      randomness: 0,
      animationSpeed: 0,
      showAccent: false,
    });

    expect(result.totalBranchesDrawn).toBe(7); // 2^3 - 1
    expect(renderer.drawBranch).toHaveBeenCalledTimes(7);
  });

  it('initializes the renderer with the default canvas dimensions before drawing', async () => {
    const renderer = createRendererSpy();
    const service = new FractalService(renderer, new SpeedControlService(), new ConfigService());

    await service.generate({
      depth: 1,
      angle: 30,
      lengthFactor: 0.7,
      trunkLength: 120,
      lineWidth: 4,
      colors: { trunk: '#8B4513', leaf: '#228B22', accent: '#FF69B4' },
      randomness: 0,
      animationSpeed: 0,
      showAccent: false,
    });

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

    await service.generate({
      depth: 1,
      angle: 30,
      lengthFactor: 0.7,
      trunkLength: 50,
      lineWidth: 4,
      colors: { trunk: '#8B4513', leaf: '#228B22', accent: '#FF69B4' },
      randomness: 0,
      animationSpeed: 0,
      showAccent: false,
    });

    expect(renderer.initialize).toHaveBeenCalledWith(canvasConfig);
    expect(renderer.drawBranch).toHaveBeenCalledWith(
      120, // width / 2
      210, // height (bottom edge)
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      expect.any(String)
    );
  });

  it('delegates clear() to the renderer', () => {
    const renderer = createRendererSpy();
    const service = new FractalService(renderer, new SpeedControlService(), new ConfigService());

    service.clear();

    expect(renderer.clear).toHaveBeenCalledOnce();
  });
});
