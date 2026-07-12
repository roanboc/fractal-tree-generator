// Parameters of the dendrite snowflake preset. Real snow crystals grow six
// arms with side spikes that themselves carry sub-spikes — a naturally
// recursive shape, so the snowflake is a fixed turtle program parameterized
// by these few knobs.

export interface SnowflakeParams {
  /** 2–6 — recursion levels; each level adds a generation of spikes. */
  depth: number;
  /** 40–80° — angle between the arm spine and its side spikes. */
  branchAngle: number;
  /** 0.2–0.55 — spike length relative to the spine segment it grows from. */
  sideScale: number;
  /** 0.55–0.85 — how much the arm spine shrinks per segment. */
  spineScale: number;
  /** 40–260 px — length of the first spine segment of each arm. */
  size: number;
  /** 0–0.15 — "frost": tiny random variation so no two flakes match. */
  jitter: number;
  /** Color of the arms. */
  color: string;
  /** Color of the outermost spike generation. */
  tipColor: string;
  /** ms delay per segment (0 = instant). */
  animationSpeed: number;
  /** ms to animate each stroke (0 = instant). */
  strokeDuration: number;
}
