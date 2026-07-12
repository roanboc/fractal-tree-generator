import { describe, expect, it, vi } from 'vitest';
import {
  SnowflakeService,
  SNOWFLAKE_DEFAULTS,
  validateSnowflakeParams,
} from '../../src/core/application/SnowflakeService';
import { SpeedControlService } from '../../src/core/application/SpeedControlService';
import { TurtleFractalService } from '../../src/core/application/TurtleFractalService';
import { CanvasConfig } from '../../src/core/domain/types';
import { IRendererService } from '../../src/core/ports';

const CANVAS: CanvasConfig = { width: 800, height: 600, backgroundColor: '#000' };

function createRendererSpy(): IRendererService {
  return {
    initialize: vi.fn(),
    drawBranch: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn(),
  };
}

function createService(renderer: IRendererService): SnowflakeService {
  return new SnowflakeService(
    new TurtleFractalService(renderer, new SpeedControlService(), CANVAS)
  );
}

describe('SnowflakeService', () => {
  it('draws 6·(3^depth − 1)/2 segments with jitter 0', async () => {
    const renderer = createRendererSpy();
    const service = createService(renderer);

    const result = await service.generate({ depth: 5, jitter: 0 });

    expect(result.segmentsDrawn).toBe((6 * (Math.pow(3, 5) - 1)) / 2); // 726
    expect(result.truncated).toBe(false);
  });

  it('produces six-fold symmetric segments with jitter 0', async () => {
    const renderer = createRendererSpy();
    const service = createService(renderer);

    await service.generate({ depth: 3, jitter: 0 });

    const calls = (renderer.drawBranch as ReturnType<typeof vi.fn>).mock.calls;
    const perArm = calls.length / 6;
    expect(perArm).toBe((Math.pow(3, 3) - 1) / 2); // 13 per arm

    const cx = CANVAS.width / 2;
    const cy = CANVAS.height / 2;
    const cos60 = Math.cos(Math.PI / 3);
    const sin60 = Math.sin(Math.PI / 3);

    for (let i = 0; i < perArm; i++) {
      const a = calls[i];
      const b = calls[perArm + i];
      // Rotate arm 0's segment start by +60° in math coords (canvas y points
      // down, so flip, rotate, flip back).
      const px = (a[0] as number) - cx;
      const py = -((a[1] as number) - cy);
      const rx = px * cos60 - py * sin60;
      const ry = px * sin60 + py * cos60;
      expect(b[0]).toBeCloseTo(cx + rx, 6);
      expect(b[1]).toBeCloseTo(cy - ry, 6);
      // Same length, heading shifted by exactly 60°.
      expect(b[2]).toBeCloseTo(a[2] as number, 6);
      expect((b[3] as number) - (a[3] as number)).toBeCloseTo(Math.PI / 3, 6);
    }
  });

  it('clamps out-of-range parameters', () => {
    const params = validateSnowflakeParams({ depth: 99, sideScale: -1, size: 9999 });
    expect(params.depth).toBe(6);
    expect(params.sideScale).toBe(0.2);
    expect(params.size).toBe(260);
    expect(params.color).toBe(SNOWFLAKE_DEFAULTS.color);
  });
});
