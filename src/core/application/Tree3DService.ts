// The 3D branching rule (chapter 6): grow an n-child tree in space. Each
// child tilts branchAngle away from its parent's axis and the whole ring of
// children twists a little further around that axis every level, so the
// crown spirals instead of staying in fixed planes.
//
// The build is breadth-first on purpose: segments come out ordered by level
// (renderers stagger growth by it) and hitting the segment budget trims the
// outermost twigs evenly instead of one lopsided limb.

import { CanvasConfig } from '../domain/types';
import {
  Segment3D,
  Tree3DParams,
  Tree3DParamsInput,
  Tree3DRenderResult,
  TREE3D_MAX_SEGMENTS,
  Vec3,
} from '../domain/tree3d';
import { ITree3DRendererService, ITree3DService } from '../ports';
import { clamp } from './math';

export const TREE3D_DEFAULTS: Tree3DParams = {
  depth: 7,
  branches: 3,
  branchAngle: 32,
  twist: 24,
  lengthFactor: 0.68,
  wildness: 0.35,
  colors: { trunk: '#a86a33', leaf: '#34d399' },
};

// Ranges and their rationale: docs/ea/2_business/5_domain-context-and-rules.md
// ("3D tree rules").
const CONSTRAINTS: Record<
  'depth' | 'branches' | 'branchAngle' | 'twist' | 'lengthFactor' | 'wildness',
  { min: number; max: number }
> = {
  depth: { min: 1, max: 8 },
  branches: { min: 2, max: 5 },
  branchAngle: { min: 10, max: 80 },
  twist: { min: 0, max: 120 },
  lengthFactor: { min: 0.5, max: 0.8 },
  wildness: { min: 0, max: 1 },
};

export function validateTree3DParams(input: Tree3DParamsInput): Tree3DParams {
  const merged: Tree3DParams = {
    ...TREE3D_DEFAULTS,
    ...input,
    colors: { ...TREE3D_DEFAULTS.colors, ...input.colors },
  };
  for (const key of Object.keys(CONSTRAINTS) as (keyof typeof CONSTRAINTS)[]) {
    merged[key] = clamp(merged[key], CONSTRAINTS[key].min, CONSTRAINTS[key].max);
  }
  merged.depth = Math.round(merged.depth);
  merged.branches = Math.round(merged.branches);
  return merged;
}

// World units are arbitrary — the renderer frames the scene — so the trunk
// size is fixed and only the shape parameters are exposed to the visitor.
const TRUNK_LENGTH = 100;
const TRUNK_WIDTH = 4.5;
const WIDTH_FALLOFF = 0.72;

const DEFAULT_CANVAS: CanvasConfig = {
  width: 880,
  height: 640,
  backgroundColor: '#0b1020',
};

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function scale(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function normalize(v: Vec3): Vec3 {
  const len = Math.sqrt(dot(v, v)) || 1;
  return scale(v, 1 / len);
}

/** Rodrigues' rotation of v around the unit axis by the given angle. */
function rotateAround(v: Vec3, axis: Vec3, angle: number): Vec3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const axv = cross(axis, v);
  const axd = dot(axis, v) * (1 - cos);
  return {
    x: v.x * cos + axv.x * sin + axis.x * axd,
    y: v.y * cos + axv.y * sin + axis.y * axd,
    z: v.z * cos + axv.z * sin + axis.z * axd,
  };
}

/** One branch tip waiting to grow: its pose (dir ⊥ up, both unit) and size. */
interface GrowthTip {
  origin: Vec3;
  dir: Vec3;
  up: Vec3;
  length: number;
  level: number;
}

export class Tree3DService implements ITree3DService {
  constructor(
    private readonly renderer: ITree3DRendererService,
    private readonly canvasConfig: CanvasConfig = DEFAULT_CANVAS,
    private readonly rng: () => number = Math.random
  ) {}

  async generate(input: Tree3DParamsInput): Promise<Tree3DRenderResult> {
    const params = validateTree3DParams(input);
    const startTime = Date.now();

    const { segments, truncated } = this.buildScene(params);

    this.renderer.initialize(this.canvasConfig);
    this.renderer.presentScene(segments);

    return {
      segmentsBuilt: segments.length,
      truncated,
      generationTimeMs: Date.now() - startTime,
    };
  }

  clear(): void {
    this.renderer.clear();
  }

  private buildScene(params: Tree3DParams): { segments: Segment3D[]; truncated: boolean } {
    const segments: Segment3D[] = [];
    let truncated = false;
    const branchAngleRad = (params.branchAngle * Math.PI) / 180;
    const twistRad = (params.twist * Math.PI) / 180;
    // ± up to half the nominal value at full wildness, like the 2D jitter.
    const wobble = (spread: number): number => (this.rng() * 2 - 1) * spread * params.wildness;

    const queue: GrowthTip[] = [
      {
        origin: { x: 0, y: 0, z: 0 },
        dir: { x: 0, y: 1, z: 0 },
        up: { x: 0, y: 0, z: 1 },
        length: TRUNK_LENGTH,
        level: 1,
      },
    ];

    // Breadth-first: the queue index walks forward instead of shift()-ing so
    // the build stays O(n) even at the segment budget.
    for (let i = 0; i < queue.length; i++) {
      const tip = queue[i];
      if (segments.length >= TREE3D_MAX_SEGMENTS) {
        // This tip (and everything after it) will never be drawn.
        truncated = true;
        break;
      }

      const end = add(tip.origin, scale(tip.dir, tip.length));
      segments.push({
        start: tip.origin,
        end,
        width: TRUNK_WIDTH * Math.pow(WIDTH_FALLOFF, tip.level - 1),
        // Leaf color near the crown's tips, trunk color elsewhere — the same
        // convention as the 2D tree.
        color: params.depth - tip.level < 2 ? params.colors.leaf : params.colors.trunk,
        level: tip.level,
      });

      if (tip.level >= params.depth) continue;

      for (let child = 0; child < params.branches; child++) {
        // Where around the parent axis this child sprouts: evenly spaced,
        // shifted by the accumulating twist, plus a wildness wobble.
        const azimuth =
          (child / params.branches) * 2 * Math.PI + twistRad * tip.level + wobble(0.5);
        const tilt = branchAngleRad * (1 + wobble(0.5));

        const swingAxis = rotateAround(tip.up, tip.dir, azimuth);
        const childDir = rotateAround(tip.dir, swingAxis, tilt);
        // Rotating 90° further along the same swing gives a vector that is
        // perpendicular to childDir, keeping the frame orthonormal.
        const childUp = rotateAround(tip.dir, swingAxis, tilt + Math.PI / 2);

        queue.push({
          origin: end,
          dir: normalize(childDir),
          up: normalize(childUp),
          length: tip.length * params.lengthFactor * (1 + wobble(0.25)),
          level: tip.level + 1,
        });
      }
    }

    return { segments, truncated };
  }
}
