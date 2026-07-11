export interface FractalColors {
  trunk: string;
  leaf: string;
  accent: string;
}

/**
 * A closed numeric range. Interval parameters are sampled per branch while
 * the tree grows: wildness (randomness) decides how far from the interval's
 * midpoint each sample may land — 0 = always the midpoint, 1 = anywhere in
 * the interval.
 */
export interface Interval {
  min: number;
  max: number;
}

export interface FractalParams {
  depth: Interval; // 1–12   — iterations; each branch tip stops inside this range
  angle: Interval; // 1–90   — branch angle in degrees, sampled per split
  lengthFactor: Interval; // 0.1–0.9 — shrink per level, sampled per branch
  trunkLength: number; // 10–500 — initial trunk length in pixels
  lineWidth: number; // 1–20  — initial line thickness in pixels
  colors: FractalColors;
  randomness: number; // 0–1   — wildness: how much of each interval is used
  animationSpeed: number; // 0–10000 — ms delay per branch drawn (0 = instant)
  strokeDuration: number; // 0–2000 — ms to draw each stick base-to-tip (0 = instant)
  showAccent: boolean;
}

/**
 * Loose input accepted by validation: interval parameters may be given as a
 * single number (treated as a fixed interval min = max = value).
 */
export type FractalParamsInput = Omit<
  Partial<FractalParams>,
  'depth' | 'angle' | 'lengthFactor' | 'colors'
> & {
  depth?: number | Interval;
  angle?: number | Interval;
  lengthFactor?: number | Interval;
  colors?: Partial<FractalColors>;
};

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface RenderResult {
  outputPath: string;
  generationTimeMs: number;
  totalBranchesDrawn: number;
}

export interface FractalLogEntry {
  id?: number;
  timestamp: string; // ISO 8601
  params: FractalParams;
  generationTimeMs: number;
  outputPath: string;
  totalBranchesDrawn: number;
}
