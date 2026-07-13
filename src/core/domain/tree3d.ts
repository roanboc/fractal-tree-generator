// Domain model for the 3D tree chapter: the same branching rule as the 2D
// tree, grown in space — each split tilts away from its parent and twists
// around the parent's axis. The engine builds pure geometry (Segment3D);
// cameras, projection and interaction belong to renderer adapters.
//
// Pure types only. Must stay DOM- and Node-free.

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** One branch of the built scene — the atomic drawing unit, like Branch in 2D. */
export interface Segment3D {
  start: Vec3;
  end: Vec3;
  /** World-space thickness (the trunk is ~100 world units long). */
  width: number;
  /** Any valid CSS color string. */
  color: string;
  /** 1-based recursion level; renderers may stagger growth by it. */
  level: number;
}

export interface Tree3DColors {
  /** Color of most branches. */
  trunk: string;
  /** Color of branches near the crown's tips. */
  leaf: string;
}

/**
 * The 3D tree's Fractal Rule. Ranges and their rationale are documented in
 * docs/ea/2_business/5_domain-context-and-rules.md ("3D tree rules") and
 * enforced in exactly one place, validateTree3DParams.
 */
export interface Tree3DParams {
  /** 1–8 — how many times the branching rule repeats. */
  depth: number;
  /** 2–5 — children sprouting at every tip, spread evenly around the parent. */
  branches: number;
  /** 10–80° — how far each child tilts away from its parent's axis. */
  branchAngle: number;
  /** 0–120° — extra rotation of each level's children around the parent axis. */
  twist: number;
  /** 0.5–0.8 — child length as a fraction of the parent's. */
  lengthFactor: number;
  /** 0–1 — random nudges on every tilt, twist and length. */
  wildness: number;
  colors: Tree3DColors;
}

/** Loose input accepted by validation: colors may be given partially. */
export type Tree3DParamsInput = Partial<Omit<Tree3DParams, 'colors'>> & {
  colors?: Partial<Tree3DColors>;
};

export interface Tree3DRenderResult {
  segmentsBuilt: number;
  /** True when TREE3D_MAX_SEGMENTS stopped the build early. */
  truncated: boolean;
  generationTimeMs: number;
}

/**
 * Hard budget on scene segments (safety before spectacle): the full
 * 5-branch depth-8 crown would be ~98 000 segments. The build is
 * breadth-first, so hitting the budget trims the outermost twigs evenly.
 */
export const TREE3D_MAX_SEGMENTS = 15000;
