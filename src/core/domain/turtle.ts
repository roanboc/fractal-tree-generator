// Domain model for the generic turtle-fractal engine. A fractal is a small
// program of turtle steps; the whole program may call itself again (recurse)
// from up to MAX_BRANCHES points, which is what makes it a fractal.
//
// Pure types only — shared by the interpreter, the formula parser, the
// snowflake preset and the web UI. Must stay DOM- and Node-free.

/** Maximum number of `recurse` (self-call) steps allowed in one program. */
export const MAX_BRANCHES = 5;

/** Maximum `[...]` nesting depth allowed in one program. */
export const MAX_NESTING = 4;

export type TurtleStep =
  /** Draw a segment forward: length = scale × the turtle's current length. */
  | { kind: 'draw'; scale: number }
  /** Move forward without drawing. */
  | { kind: 'move'; scale: number }
  /** Rotate the heading; positive = counter-clockwise. */
  | { kind: 'turn'; degrees: number }
  /** Save the turtle's pose, run the steps, then restore the pose. */
  | { kind: 'group'; steps: TurtleStep[] }
  /**
   * Re-run the whole program one level deeper with length × scale, then
   * restore the pose (a self-call is implicitly bracketed).
   */
  | { kind: 'recurse'; scale: number };

export interface TurtleProgram {
  steps: TurtleStep[];
}

export interface TurtleColors {
  /** Color of most segments. */
  main: string;
  /** Color of segments drawn near the recursion tips. */
  tip: string;
}

export interface TurtleOptions {
  /** 1–8 — recursion levels; each `recurse` step goes one level deeper. */
  depth: number;
  /** 1–12 — the program is repeated rotated by 360°/symmetry around the origin. */
  symmetry: number;
  /** 10–400 px — the turtle's length at level 1. */
  baseLength: number;
  /** 0.5–12 px — segment thickness at level 1. */
  lineWidth: number;
  /** 0.5–1 — thickness multiplier applied per level. */
  widthFalloff: number;
  colors: TurtleColors;
  /** 0–0.3 — ± relative noise applied to every turn and scale. */
  jitter: number;
  /** Initial heading in radians; π/2 points up. */
  startAngle: number;
  origin: 'bottom-center' | 'center';
  /** ms delay per segment (fed to the speed control by the caller). */
  animationSpeed: number;
  /** ms to animate each stroke (0 = instant). */
  strokeDuration: number;
  /** Hard budget on drawn segments; the run truncates when it is spent. */
  maxSegments: number;
}

export interface TurtleRenderResult {
  segmentsDrawn: number;
  /** True when the maxSegments budget stopped the run early. */
  truncated: boolean;
  generationTimeMs: number;
}
