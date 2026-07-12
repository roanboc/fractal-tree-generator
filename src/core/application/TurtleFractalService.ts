import { CanvasConfig } from '../domain/types';
import { TurtleOptions, TurtleProgram, TurtleRenderResult, TurtleStep } from '../domain/turtle';
import { IRendererService, ISpeedControlService, ITurtleFractalService } from '../ports';
import { clamp } from './math';

const DEFAULT_CANVAS: CanvasConfig = {
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
};

export const TURTLE_DEFAULTS: TurtleOptions = {
  depth: 4,
  symmetry: 1,
  baseLength: 100,
  lineWidth: 3,
  widthFalloff: 0.85,
  colors: { main: '#34d399', tip: '#a7f3d0' },
  jitter: 0,
  startAngle: Math.PI / 2,
  origin: 'bottom-center',
  animationSpeed: 0,
  strokeDuration: 0,
  maxSegments: 20000,
};

/** Below this segment length recursion stops regardless of depth. */
const MIN_LENGTH = 0.5;

interface Turtle {
  x: number;
  y: number;
  heading: number;
  length: number;
}

interface RunState {
  segments: number;
  truncated: boolean;
}

/**
 * Interprets a TurtleProgram against the renderer. Unlike FractalService the
 * branching rule is data, not code, so any fractal expressible as
 * draw/move/turn/group/recurse steps can be drawn — the snowflake and the
 * "create your own" page both run on this engine.
 *
 * All run state is local to run(), but the canvas itself is shared, so
 * overlapping run() calls on one canvas still interleave their strokes —
 * callers serialize runs just like with FractalService (docs/ea/4_application/5_interface-contracts.md).
 */
export class TurtleFractalService implements ITurtleFractalService {
  constructor(
    private readonly renderer: IRendererService,
    private readonly speedControl: ISpeedControlService,
    private readonly canvasConfig: CanvasConfig = DEFAULT_CANVAS,
    private readonly rng: () => number = Math.random
  ) {}

  async run(program: TurtleProgram, options: Partial<TurtleOptions>): Promise<TurtleRenderResult> {
    const opts = validateOptions(options);
    const startTime = Date.now();

    this.renderer.initialize(this.canvasConfig);

    const originX = this.canvasConfig.width / 2;
    const originY =
      opts.origin === 'center' ? this.canvasConfig.height / 2 : this.canvasConfig.height;

    const state: RunState = { segments: 0, truncated: false };

    for (let arm = 0; arm < opts.symmetry && !state.truncated; arm++) {
      const turtle: Turtle = {
        x: originX,
        y: originY,
        heading: opts.startAngle + (arm * 2 * Math.PI) / opts.symmetry,
        length: opts.baseLength,
      };
      await this.execute(program, turtle, 1, opts, state);
    }

    return {
      segmentsDrawn: state.segments,
      truncated: state.truncated,
      generationTimeMs: Date.now() - startTime,
    };
  }

  clear(): void {
    this.renderer.clear();
  }

  private async execute(
    program: TurtleProgram,
    turtle: Turtle,
    level: number,
    opts: TurtleOptions,
    state: RunState,
    steps: TurtleStep[] = program.steps
  ): Promise<void> {
    for (const step of steps) {
      if (state.truncated) return;

      switch (step.kind) {
        case 'draw': {
          if (state.segments >= opts.maxSegments) {
            state.truncated = true;
            return;
          }
          const length = turtle.length * this.jittered(step.scale, opts.jitter);
          const color = opts.depth - level < 2 ? opts.colors.tip : opts.colors.main;
          const lineWidth = Math.max(0.5, opts.lineWidth * Math.pow(opts.widthFalloff, level - 1));
          await this.renderer.drawBranch(
            turtle.x,
            turtle.y,
            length,
            turtle.heading,
            lineWidth,
            color,
            opts.strokeDuration
          );
          state.segments++;
          await this.speedControl.wait();
          this.advance(turtle, length);
          break;
        }

        case 'move': {
          const length = turtle.length * this.jittered(step.scale, opts.jitter);
          this.advance(turtle, length);
          break;
        }

        case 'turn': {
          turtle.heading += (this.jittered(step.degrees, opts.jitter) * Math.PI) / 180;
          break;
        }

        case 'group': {
          const saved = { ...turtle };
          await this.execute(program, turtle, level, opts, state, step.steps);
          Object.assign(turtle, saved);
          break;
        }

        case 'recurse': {
          if (level >= opts.depth) break;
          const nextLength = turtle.length * this.jittered(step.scale, opts.jitter);
          if (nextLength < MIN_LENGTH) break;
          const saved = { ...turtle };
          turtle.length = nextLength;
          await this.execute(program, turtle, level + 1, opts, state);
          Object.assign(turtle, saved);
          break;
        }
      }
    }
  }

  private advance(turtle: Turtle, length: number): void {
    // Canvas y grows downward, so moving "up" subtracts (same as FractalService).
    turtle.x += length * Math.cos(turtle.heading);
    turtle.y -= length * Math.sin(turtle.heading);
  }

  private jittered(value: number, jitter: number): number {
    if (jitter <= 0) return value;
    return value * (1 + jitter * (this.rng() * 2 - 1));
  }
}

/** Merge partial options over the defaults and clamp every field to range. */
export function validateOptions(input: Partial<TurtleOptions>): TurtleOptions {
  const merged: TurtleOptions = {
    ...TURTLE_DEFAULTS,
    ...input,
    colors: { ...TURTLE_DEFAULTS.colors, ...input.colors },
  };
  return {
    ...merged,
    depth: clamp(Math.round(merged.depth), 1, 8),
    symmetry: clamp(Math.round(merged.symmetry), 1, 12),
    baseLength: clamp(merged.baseLength, 10, 400),
    lineWidth: clamp(merged.lineWidth, 0.5, 12),
    widthFalloff: clamp(merged.widthFalloff, 0.5, 1),
    jitter: clamp(merged.jitter, 0, 0.3),
    animationSpeed: clamp(merged.animationSpeed, 0, 10000),
    strokeDuration: clamp(merged.strokeDuration, 0, 2000),
    maxSegments: clamp(Math.round(merged.maxSegments), 1, 50000),
  };
}
