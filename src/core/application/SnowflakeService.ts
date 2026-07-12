import { SnowflakeParams } from '../domain/snowflake';
import { TurtleProgram, TurtleRenderResult } from '../domain/turtle';
import { ISnowflakeService, ITurtleFractalService } from '../ports';
import { clamp } from './math';

export const SNOWFLAKE_DEFAULTS: SnowflakeParams = {
  depth: 5,
  branchAngle: 60,
  sideScale: 0.36,
  spineScale: 0.72,
  size: 110,
  jitter: 0.04,
  color: '#38bdf8',
  tipColor: '#7dd3fc',
  animationSpeed: 0,
  strokeDuration: 0,
};

/** Six arms, drawn rotated around the canvas center. */
export const SNOWFLAKE_SYMMETRY = 6;

/**
 * One arm of a dendrite snow crystal: grow a spine segment, sprout a spike
 * pair, then continue the (shrinking) spine. Both the spikes and the spine
 * are self-calls, so spikes carry sub-spikes — like the real thing.
 */
export function buildDendriteProgram(params: SnowflakeParams): TurtleProgram {
  return {
    steps: [
      { kind: 'draw', scale: 1 },
      {
        kind: 'group',
        steps: [
          { kind: 'turn', degrees: params.branchAngle },
          { kind: 'recurse', scale: params.sideScale },
        ],
      },
      {
        kind: 'group',
        steps: [
          { kind: 'turn', degrees: -params.branchAngle },
          { kind: 'recurse', scale: params.sideScale },
        ],
      },
      { kind: 'recurse', scale: params.spineScale },
    ],
  };
}

export function validateSnowflakeParams(input: Partial<SnowflakeParams>): SnowflakeParams {
  const merged = { ...SNOWFLAKE_DEFAULTS, ...input };
  return {
    ...merged,
    depth: clamp(Math.round(merged.depth), 2, 6),
    branchAngle: clamp(merged.branchAngle, 40, 80),
    sideScale: clamp(merged.sideScale, 0.2, 0.55),
    spineScale: clamp(merged.spineScale, 0.55, 0.85),
    size: clamp(merged.size, 40, 260),
    jitter: clamp(merged.jitter, 0, 0.15),
    animationSpeed: clamp(merged.animationSpeed, 0, 10000),
    strokeDuration: clamp(merged.strokeDuration, 0, 2000),
  };
}

/**
 * Thin façade over the turtle engine: turns friendly snowflake knobs into a
 * dendrite program run with 6-fold symmetry from the canvas center.
 */
export class SnowflakeService implements ISnowflakeService {
  constructor(private readonly engine: ITurtleFractalService) {}

  async generate(input: Partial<SnowflakeParams>): Promise<TurtleRenderResult> {
    const params = validateSnowflakeParams(input);
    return this.engine.run(buildDendriteProgram(params), {
      depth: params.depth,
      symmetry: SNOWFLAKE_SYMMETRY,
      baseLength: params.size,
      lineWidth: 2.6,
      widthFalloff: 0.82,
      colors: { main: params.color, tip: params.tipColor },
      jitter: params.jitter,
      startAngle: Math.PI / 2,
      origin: 'center',
      animationSpeed: params.animationSpeed,
      strokeDuration: params.strokeDuration,
    });
  }

  clear(): void {
    this.engine.clear();
  }
}
