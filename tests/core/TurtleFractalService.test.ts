import { describe, expect, it, vi } from 'vitest';
import {
  TurtleFractalService,
  validateOptions,
} from '../../src/core/application/TurtleFractalService';
import { SpeedControlService } from '../../src/core/application/SpeedControlService';
import { parseFormula } from '../../src/core/application/turtle/formula';
import { TurtleProgram } from '../../src/core/domain/turtle';
import { IRendererService } from '../../src/core/ports';

function createRendererSpy(): IRendererService {
  return {
    initialize: vi.fn(),
    drawBranch: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn(),
  };
}

function createService(renderer: IRendererService): TurtleFractalService {
  return new TurtleFractalService(renderer, new SpeedControlService());
}

function program(source: string): TurtleProgram {
  const result = parseFormula(source);
  if (!result.ok) throw new Error(`bad test formula: ${source}`);
  return result.program;
}

const TREE = 'F1 [+25 T0.7] [-25 T0.7]';

describe('TurtleFractalService', () => {
  it('draws 2^depth - 1 segments for the tree-equivalent program', async () => {
    const renderer = createRendererSpy();
    const service = createService(renderer);

    const result = await service.run(program(TREE), { depth: 5, jitter: 0, symmetry: 1 });

    expect(result.segmentsDrawn).toBe(31);
    expect(result.truncated).toBe(false);
    expect(renderer.drawBranch).toHaveBeenCalledTimes(31);
  });

  it('multiplies segments by symmetry and rotates each arm by 2π/symmetry', async () => {
    const renderer = createRendererSpy();
    const service = createService(renderer);

    const result = await service.run(program('F1'), {
      depth: 1,
      symmetry: 6,
      startAngle: Math.PI / 2,
      origin: 'center',
    });

    expect(result.segmentsDrawn).toBe(6);
    const calls = (renderer.drawBranch as ReturnType<typeof vi.fn>).mock.calls;
    const angles = calls.map((call) => call[3] as number);
    for (let arm = 0; arm < 6; arm++) {
      expect(angles[arm]).toBeCloseTo(Math.PI / 2 + (arm * Math.PI) / 3, 6);
    }
  });

  it('restores the turtle pose after a bracketed group', async () => {
    const renderer = createRendererSpy();
    const service = createService(renderer);

    // Draw, then a detour in brackets, then draw again: the third segment
    // must start exactly where the first one ended.
    await service.run(program('F1 [+90 F1] F1'), {
      depth: 1,
      baseLength: 100,
      startAngle: Math.PI / 2,
      origin: 'bottom-center',
    });

    const calls = (renderer.drawBranch as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls).toHaveLength(3);
    const [firstX, firstY] = [calls[0][0] as number, calls[0][1] as number];
    const tipX = firstX + 100 * Math.cos(Math.PI / 2);
    const tipY = firstY - 100 * Math.sin(Math.PI / 2);
    // Segment inside the group starts at the tip…
    expect(calls[1][0]).toBeCloseTo(tipX, 6);
    expect(calls[1][1]).toBeCloseTo(tipY, 6);
    // …and so does the segment after the group (pose was restored).
    expect(calls[2][0]).toBeCloseTo(tipX, 6);
    expect(calls[2][1]).toBeCloseTo(tipY, 6);
    expect(calls[2][3]).toBeCloseTo(Math.PI / 2, 6); // heading restored too
  });

  it('moves without drawing on M steps', async () => {
    const renderer = createRendererSpy();
    const service = createService(renderer);

    const result = await service.run(program('M1 F1'), {
      depth: 1,
      baseLength: 50,
      startAngle: 0,
      origin: 'center',
    });

    expect(result.segmentsDrawn).toBe(1);
    const call = (renderer.drawBranch as ReturnType<typeof vi.fn>).mock.calls[0];
    // The drawn segment starts one move-length away from the origin (400, 300).
    expect(call[0]).toBeCloseTo(450, 6);
    expect(call[1]).toBeCloseTo(300, 6);
  });

  it('truncates explosive programs at the segment budget without hanging', async () => {
    const renderer = createRendererSpy();
    const service = createService(renderer);

    // 5 self-calls per level would be 5^8 segments — the budget must stop it.
    const result = await service.run(program('F1 T0.9 T0.9 T0.9 T0.9 T0.9'), {
      depth: 8,
      maxSegments: 500,
    });

    expect(result.truncated).toBe(true);
    expect(result.segmentsDrawn).toBeLessThanOrEqual(500);
    expect(renderer.drawBranch).toHaveBeenCalledTimes(result.segmentsDrawn);
  });

  it('stops recursing when segments get shorter than half a pixel', async () => {
    const renderer = createRendererSpy();
    const service = createService(renderer);

    const result = await service.run(program('F1 T0.1'), {
      depth: 8,
      baseLength: 10,
    });

    // 10 → 1 → 0.1(<0.5 stops): only two levels draw.
    expect(result.segmentsDrawn).toBe(2);
    expect(result.truncated).toBe(false);
  });

  it('clamps out-of-range options', () => {
    const opts = validateOptions({ depth: 99, symmetry: 0, jitter: 5, maxSegments: 1e9 });
    expect(opts.depth).toBe(8);
    expect(opts.symmetry).toBe(1);
    expect(opts.jitter).toBe(0.3);
    expect(opts.maxSegments).toBe(50000);
  });
});
