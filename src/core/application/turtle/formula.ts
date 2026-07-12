// The tiny turtle-formula language for user-defined fractals.
//
//   F<n>   draw forward, length ×n            F1
//   M<n>   move forward without drawing       M0.5
//   +<n>   turn left n degrees                +25
//   -<n>   turn right n degrees               -25
//   [ … ]  branch: save the turtle, run the steps, restore it
//   T<n>   the self-call: re-run the whole formula one level deeper, ×n
//
// Letters are case-insensitive, whitespace is free, `#` comments to the end
// of the line. The classic tree is `F1 [+25 T0.7] [-25 T0.7]`.
//
// Errors carry machine codes + character positions, never prose: the web
// layer translates codes through i18n (dsl.err.<code>), keeping core
// language-neutral.

import { MAX_BRANCHES, MAX_NESTING, TurtleProgram, TurtleStep } from '../../domain/turtle';

export type FormulaErrorCode =
  | 'unexpectedChar'
  | 'expectedNumber'
  | 'unclosedBracket'
  | 'unexpectedClose'
  | 'emptyProgram'
  | 'emptyBranch'
  | 'tooManyBranches'
  | 'scaleOutOfRange'
  | 'turnOutOfRange'
  | 'tooDeepNesting'
  | 'noDraw';

export interface FormulaError {
  code: FormulaErrorCode;
  /** 0-based character offset into the source. */
  position: number;
  /** Length of the offending span (≥ 1). */
  length: number;
  /** The offending token text, when useful for the message. */
  detail?: string;
}

export type ParseResult =
  { ok: true; program: TurtleProgram } | { ok: false; errors: FormulaError[] };

/** Validation ranges (also enforced by the rule-builder UI). */
export const SCALE_RANGE = { min: 0.05, max: 3 };
export const RECURSE_SCALE_RANGE = { min: 0.1, max: 0.95 };
export const TURN_RANGE = { min: -360, max: 360 };

// A step annotated with its source span so semantic errors can point at it.
interface Spanned {
  step: TurtleStep;
  pos: number;
  len: number;
  children?: Spanned[];
}

interface Cursor {
  source: string;
  index: number;
}

function skipIgnored(c: Cursor): void {
  while (c.index < c.source.length) {
    const ch = c.source[c.index];
    if (ch === '#') {
      while (c.index < c.source.length && c.source[c.index] !== '\n') c.index++;
    } else if (/\s/.test(ch)) {
      c.index++;
    } else {
      return;
    }
  }
}

/** Read a number like 12, 0.7, .5 at the cursor; null when none is present. */
function readNumber(c: Cursor): { value: number; pos: number; len: number } | null {
  skipIgnored(c);
  const match = /^\d+(\.\d+)?|^\.\d+/.exec(c.source.slice(c.index));
  if (!match) return null;
  const pos = c.index;
  c.index += match[0].length;
  return { value: parseFloat(match[0]), pos, len: match[0].length };
}

function parseSteps(
  c: Cursor,
  nesting: number,
  errors: FormulaError[]
): { steps: Spanned[]; closed: boolean } {
  const steps: Spanned[] = [];

  for (;;) {
    skipIgnored(c);
    if (c.index >= c.source.length) return { steps, closed: false };

    const pos = c.index;
    const ch = c.source[c.index];
    const upper = ch.toUpperCase();

    if (upper === 'F' || upper === 'M' || upper === 'T') {
      c.index++;
      const num = readNumber(c);
      const scale = num ? num.value : upper === 'T' ? 0.7 : 1;
      const len = num ? num.pos + num.len - pos : 1;
      const kind = upper === 'F' ? 'draw' : upper === 'M' ? 'move' : 'recurse';
      steps.push({ step: { kind, scale } as TurtleStep, pos, len });
    } else if (ch === '+' || ch === '-') {
      c.index++;
      const num = readNumber(c);
      if (!num) {
        errors.push({ code: 'expectedNumber', position: pos, length: 1, detail: ch });
        continue;
      }
      const degrees = ch === '+' ? num.value : -num.value;
      steps.push({ step: { kind: 'turn', degrees }, pos, len: num.pos + num.len - pos });
    } else if (ch === '[') {
      c.index++;
      if (nesting + 1 > MAX_NESTING) {
        errors.push({ code: 'tooDeepNesting', position: pos, length: 1 });
      }
      const inner = parseSteps(c, nesting + 1, errors);
      if (!inner.closed) {
        errors.push({ code: 'unclosedBracket', position: pos, length: 1 });
      }
      if (inner.steps.length === 0) {
        errors.push({ code: 'emptyBranch', position: pos, length: 1 });
      }
      steps.push({
        step: { kind: 'group', steps: inner.steps.map((s) => s.step) },
        pos,
        len: c.index - pos,
        children: inner.steps,
      });
    } else if (ch === ']') {
      c.index++;
      if (nesting === 0) {
        errors.push({ code: 'unexpectedClose', position: pos, length: 1 });
        continue;
      }
      return { steps, closed: true };
    } else {
      errors.push({ code: 'unexpectedChar', position: pos, length: 1, detail: ch });
      c.index++;
    }
  }
}

function validateSpanned(steps: Spanned[], errors: FormulaError[]): void {
  let branches = 0;
  let draws = 0;

  const walk = (list: Spanned[]): void => {
    for (const s of list) {
      switch (s.step.kind) {
        case 'draw':
        case 'move':
          draws += s.step.kind === 'draw' ? 1 : 0;
          if (s.step.scale < SCALE_RANGE.min || s.step.scale > SCALE_RANGE.max) {
            errors.push({
              code: 'scaleOutOfRange',
              position: s.pos,
              length: s.len,
              detail: String(s.step.scale),
            });
          }
          break;
        case 'recurse':
          branches++;
          if (branches === MAX_BRANCHES + 1) {
            errors.push({ code: 'tooManyBranches', position: s.pos, length: s.len });
          }
          if (s.step.scale < RECURSE_SCALE_RANGE.min || s.step.scale > RECURSE_SCALE_RANGE.max) {
            errors.push({
              code: 'scaleOutOfRange',
              position: s.pos,
              length: s.len,
              detail: String(s.step.scale),
            });
          }
          break;
        case 'turn':
          if (s.step.degrees < TURN_RANGE.min || s.step.degrees > TURN_RANGE.max) {
            errors.push({
              code: 'turnOutOfRange',
              position: s.pos,
              length: s.len,
              detail: String(s.step.degrees),
            });
          }
          break;
        case 'group':
          walk(s.children ?? []);
          break;
      }
    }
  };
  walk(steps);

  if (draws === 0) {
    errors.push({ code: 'noDraw', position: 0, length: 1 });
  }
}

export function parseFormula(source: string): ParseResult {
  const errors: FormulaError[] = [];
  const cursor: Cursor = { source, index: 0 };
  const { steps } = parseSteps(cursor, 0, errors);

  if (steps.length === 0 && errors.length === 0) {
    errors.push({ code: 'emptyProgram', position: 0, length: Math.max(1, source.length) });
  }
  if (errors.length === 0) {
    validateSpanned(steps, errors);
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, program: { steps: steps.map((s) => s.step) } };
}

/** Semantic checks for programs built directly as ASTs (no source positions). */
export function validateProgram(program: TurtleProgram): FormulaError[] {
  const errors: FormulaError[] = [];
  const spanned = toSpanned(program.steps);
  if (spanned.length === 0) {
    return [{ code: 'emptyProgram', position: 0, length: 1 }];
  }
  validateSpanned(spanned, errors);
  return errors;
}

function toSpanned(steps: TurtleStep[]): Spanned[] {
  return steps.map((step) => ({
    step,
    pos: 0,
    len: 1,
    children: step.kind === 'group' ? toSpanned(step.steps) : undefined,
  }));
}

/** Canonical text form; parseFormula(serializeFormula(p)) equals p. */
export function serializeFormula(program: TurtleProgram): string {
  const token = (step: TurtleStep): string => {
    switch (step.kind) {
      case 'draw':
        return `F${step.scale}`;
      case 'move':
        return `M${step.scale}`;
      case 'turn':
        return step.degrees >= 0 ? `+${step.degrees}` : `-${-step.degrees}`;
      case 'recurse':
        return `T${step.scale}`;
      case 'group':
        return `[${step.steps.map(token).join(' ')}]`;
    }
  };
  return program.steps.map(token).join(' ');
}

/**
 * Insert a step into a step list, keeping any trailing self-call(s) last.
 * "Do it all again" closes a rule: steps placed after it only run once the
 * recursion has fully unwound, which is almost never what the author
 * building a rule visually means. So new steps land before the trailing
 * self-call run — while a new self-call itself still goes at the very end.
 * (The text DSL intentionally has no such restriction.)
 */
export function insertStep(list: TurtleStep[], step: TurtleStep): void {
  let insertAt = list.length;
  if (step.kind !== 'recurse') {
    while (insertAt > 0 && list[insertAt - 1].kind === 'recurse') insertAt--;
  }
  list.splice(insertAt, 0, step);
}

/**
 * Closed-form upper bound on segments the program will draw. With D draw
 * steps and B self-calls per run, each level multiplies by B:
 * D·(B^depth − 1)/(B − 1), times symmetry. The interpreter may draw fewer
 * (min-length cutoff) but never more, so the UI can cap depth with this.
 */
export function estimateSegments(program: TurtleProgram, depth: number, symmetry: number): number {
  let draws = 0;
  let branches = 0;
  const walk = (steps: TurtleStep[]): void => {
    for (const step of steps) {
      if (step.kind === 'draw') draws++;
      else if (step.kind === 'recurse') branches++;
      else if (step.kind === 'group') walk(step.steps);
    }
  };
  walk(program.steps);

  let perArm: number;
  if (branches === 0) {
    perArm = draws;
  } else if (branches === 1) {
    perArm = draws * depth;
  } else {
    perArm = draws * ((Math.pow(branches, depth) - 1) / (branches - 1));
  }
  return Math.round(perArm * symmetry);
}
