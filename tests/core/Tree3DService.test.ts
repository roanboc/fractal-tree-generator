import { describe, expect, it, vi } from 'vitest';
import {
  Tree3DService,
  TREE3D_DEFAULTS,
  validateTree3DParams,
} from '../../src/core/application/Tree3DService';
import { Segment3D, TREE3D_MAX_SEGMENTS } from '../../src/core/domain/tree3d';
import { ITree3DRendererService } from '../../src/core/ports';

function createRendererSpy(): ITree3DRendererService & { scenes: Segment3D[][] } {
  const scenes: Segment3D[][] = [];
  return {
    scenes,
    initialize: vi.fn(),
    presentScene: vi.fn((segments: Segment3D[]) => {
      scenes.push(segments);
    }),
    setAutoRotate: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn(),
  };
}

/** Segments of a full n-ary tree: (branches^depth − 1) / (branches − 1). */
function fullTreeSegments(branches: number, depth: number): number {
  return (Math.pow(branches, depth) - 1) / (branches - 1);
}

describe('Tree3DService', () => {
  it('builds a full n-ary tree: (branches^depth − 1)/(branches − 1) segments', async () => {
    const renderer = createRendererSpy();
    const service = new Tree3DService(renderer);

    const result = await service.generate({ depth: 3, branches: 3, wildness: 0 });

    expect(result.segmentsBuilt).toBe(13); // (3^3 − 1) / 2
    expect(result.truncated).toBe(false);
    expect(renderer.scenes[0]).toHaveLength(13);
  });

  it('keeps the segment count independent of wildness', async () => {
    const renderer = createRendererSpy();
    const service = new Tree3DService(renderer);

    const result = await service.generate({ depth: 4, branches: 2, wildness: 1 });

    expect(result.segmentsBuilt).toBe(fullTreeSegments(2, 4));
  });

  it('initializes the renderer and presents the scene exactly once per generate', async () => {
    const renderer = createRendererSpy();
    const canvasConfig = { width: 880, height: 640, backgroundColor: '#0b1020' };
    const service = new Tree3DService(renderer, canvasConfig);

    await service.generate({ depth: 2 });

    expect(renderer.initialize).toHaveBeenCalledTimes(1);
    expect(renderer.initialize).toHaveBeenCalledWith(canvasConfig);
    expect(renderer.presentScene).toHaveBeenCalledTimes(1);
  });

  it('orders the scene by level (breadth-first build)', async () => {
    const renderer = createRendererSpy();
    const service = new Tree3DService(renderer);

    await service.generate({ depth: 4, branches: 3, wildness: 0 });

    const levels = renderer.scenes[0].map((s) => s.level);
    expect([...levels].sort((a, b) => a - b)).toEqual(levels);
    expect(levels[0]).toBe(1);
    expect(levels[levels.length - 1]).toBe(4);
  });

  it('stops at the segment budget and reports truncation', async () => {
    const renderer = createRendererSpy();
    const service = new Tree3DService(renderer);

    // 5 branches × depth 8 would be ~97 656 segments.
    const result = await service.generate({ depth: 8, branches: 5, wildness: 0 });

    expect(result.segmentsBuilt).toBe(TREE3D_MAX_SEGMENTS);
    expect(result.truncated).toBe(true);
  });

  it('paints the crown tips in the leaf color and the rest in trunk color', async () => {
    const renderer = createRendererSpy();
    const service = new Tree3DService(renderer);
    const colors = { trunk: '#111111', leaf: '#22ff22' };

    await service.generate({ depth: 4, branches: 2, wildness: 0, colors });

    for (const segment of renderer.scenes[0]) {
      expect(segment.color).toBe(segment.level >= 3 ? colors.leaf : colors.trunk);
    }
  });

  it('is deterministic at wildness 0', async () => {
    const rendererA = createRendererSpy();
    const rendererB = createRendererSpy();

    await new Tree3DService(rendererA).generate({ depth: 4, branches: 3, wildness: 0 });
    await new Tree3DService(rendererB).generate({ depth: 4, branches: 3, wildness: 0 });

    expect(rendererA.scenes[0]).toEqual(rendererB.scenes[0]);
  });

  it('delegates clear() to the renderer', () => {
    const renderer = createRendererSpy();
    const service = new Tree3DService(renderer);

    service.clear();

    expect(renderer.clear).toHaveBeenCalledOnce();
  });
});

describe('validateTree3DParams', () => {
  it('fills every missing field from the defaults', () => {
    expect(validateTree3DParams({})).toEqual(TREE3D_DEFAULTS);
  });

  it('clamps out-of-range values into the documented constraints', () => {
    const validated = validateTree3DParams({
      depth: 99,
      branches: 1,
      branchAngle: 200,
      twist: -30,
      lengthFactor: 0.95,
      wildness: 2,
    });

    expect(validated.depth).toBe(8);
    expect(validated.branches).toBe(2);
    expect(validated.branchAngle).toBe(80);
    expect(validated.twist).toBe(0);
    expect(validated.lengthFactor).toBe(0.8);
    expect(validated.wildness).toBe(1);
  });

  it('merges colors key-by-key against the defaults', () => {
    const validated = validateTree3DParams({ colors: { trunk: '#123456' } });
    expect(validated.colors.trunk).toBe('#123456');
    expect(validated.colors.leaf).toBe(TREE3D_DEFAULTS.colors.leaf);
  });
});
