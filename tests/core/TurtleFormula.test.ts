import { describe, expect, it } from 'vitest';
import {
  estimateSegments,
  insertStep,
  parseFormula,
  serializeFormula,
  validateProgram,
} from '../../src/core/application/turtle/formula';
import { TurtleProgram } from '../../src/core/domain/turtle';

function parseOk(source: string): TurtleProgram {
  const result = parseFormula(source);
  expect(result.ok, `expected "${source}" to parse`).toBe(true);
  if (!result.ok) throw new Error('unreachable');
  return result.program;
}

function parseErrors(source: string) {
  const result = parseFormula(source);
  expect(result.ok, `expected "${source}" to fail`).toBe(false);
  if (result.ok) throw new Error('unreachable');
  return result.errors;
}

describe('parseFormula', () => {
  it('parses the classic tree formula', () => {
    const program = parseOk('F1 [+25 T0.7] [-25 T0.7]');
    expect(program.steps).toEqual([
      { kind: 'draw', scale: 1 },
      {
        kind: 'group',
        steps: [
          { kind: 'turn', degrees: 25 },
          { kind: 'recurse', scale: 0.7 },
        ],
      },
      {
        kind: 'group',
        steps: [
          { kind: 'turn', degrees: -25 },
          { kind: 'recurse', scale: 0.7 },
        ],
      },
    ]);
  });

  it('is case-insensitive, whitespace-insensitive and supports comments', () => {
    const program = parseOk('# my fern\n f1 [ +45 t0.5 ]\n\tF.6 [-45 T0.5] t0.8');
    expect(program.steps).toHaveLength(5);
    expect(program.steps[2]).toEqual({ kind: 'draw', scale: 0.6 });
  });

  it('applies default scales when the number is omitted', () => {
    const program = parseOk('F [ +30 T ]');
    expect(program.steps[0]).toEqual({ kind: 'draw', scale: 1 });
    expect(program.steps[1]).toEqual({
      kind: 'group',
      steps: [
        { kind: 'turn', degrees: 30 },
        { kind: 'recurse', scale: 0.7 },
      ],
    });
  });

  it('reports an unclosed bracket at the opening position', () => {
    const errors = parseErrors('F1 [+25 T0.7');
    expect(errors).toEqual([{ code: 'unclosedBracket', position: 3, length: 1 }]);
  });

  it('reports a stray closing bracket', () => {
    const errors = parseErrors('F1 ] F1');
    expect(errors[0]).toMatchObject({ code: 'unexpectedClose', position: 3 });
  });

  it('reports unknown characters with their position', () => {
    const errors = parseErrors('F1 X2');
    expect(errors[0]).toMatchObject({ code: 'unexpectedChar', position: 3, detail: 'X' });
  });

  it('requires a number after a turn sign', () => {
    const errors = parseErrors('F1 +');
    expect(errors[0]).toMatchObject({ code: 'expectedNumber', position: 3 });
  });

  it('rejects an empty formula', () => {
    expect(parseErrors('')[0].code).toBe('emptyProgram');
    expect(parseErrors('  # only a comment ')[0].code).toBe('emptyProgram');
  });

  it('rejects more than five self-calls', () => {
    const errors = parseErrors('F1 T0.5 T0.5 T0.5 T0.5 T0.5 T0.5');
    expect(errors[0].code).toBe('tooManyBranches');
    // Points at the sixth T.
    expect(errors[0].position).toBe('F1 T0.5 T0.5 T0.5 T0.5 T0.5 '.length);
  });

  it('rejects recurse scales that do not shrink', () => {
    const errors = parseErrors('F1 T0.99');
    expect(errors[0]).toMatchObject({ code: 'scaleOutOfRange', position: 3 });
  });

  it('rejects nesting deeper than four brackets', () => {
    const errors = parseErrors('F1 [[[[[ F1 ]]]]]');
    expect(errors[0].code).toBe('tooDeepNesting');
  });

  it('rejects formulas that never draw', () => {
    const errors = parseErrors('+30 T0.5');
    expect(errors[0].code).toBe('noDraw');
  });

  it('rejects empty branches', () => {
    const errors = parseErrors('F1 []');
    expect(errors[0].code).toBe('emptyBranch');
  });

  it('rejects turns beyond ±360 degrees', () => {
    const errors = parseErrors('F1 +361');
    expect(errors[0].code).toBe('turnOutOfRange');
  });
});

describe('serializeFormula', () => {
  const cases: [string, string][] = [
    ['F1 [+25 T0.7] [-25 T0.7]', 'F1 [+25 T0.7] [-25 T0.7]'],
    ['f1[+60 t.36][-60 t0.36]t0.72', 'F1 [+60 T0.36] [-60 T0.36] T0.72'],
    ['F # comment\n M0.5 -12.5 T', 'F1 M0.5 -12.5 T0.7'],
  ];

  it.each(cases)('serializes %s canonically', (source, canonical) => {
    expect(serializeFormula(parseOk(source))).toBe(canonical);
  });

  it('round-trips: parse(serialize(p)) equals p', () => {
    for (const [source] of cases) {
      const program = parseOk(source);
      expect(parseOk(serializeFormula(program))).toEqual(program);
    }
  });
});

describe('validateProgram', () => {
  it('accepts a well-formed AST', () => {
    expect(validateProgram(parseOk('F1 [+25 T0.7]'))).toEqual([]);
  });

  it('flags semantic problems in builder-made ASTs', () => {
    const program: TurtleProgram = {
      steps: [
        { kind: 'turn', degrees: 400 },
        { kind: 'recurse', scale: 0.99 },
      ],
    };
    const codes = validateProgram(program).map((e) => e.code);
    expect(codes).toContain('turnOutOfRange');
    expect(codes).toContain('scaleOutOfRange');
    expect(codes).toContain('noDraw');
  });

  it('flags an empty AST', () => {
    expect(validateProgram({ steps: [] })[0].code).toBe('emptyProgram');
  });
});

describe('estimateSegments', () => {
  it('matches the closed forms', () => {
    const tree = parseOk('F1 [+25 T0.7] [-25 T0.7]');
    expect(estimateSegments(tree, 5, 1)).toBe(31); // 2^5 - 1
    const spiral = parseOk('F1 +20 T0.8');
    expect(estimateSegments(spiral, 6, 1)).toBe(6); // 1 draw × depth
    const flat = parseOk('F1 F0.5');
    expect(estimateSegments(flat, 3, 1)).toBe(2); // no recursion
    const snow = parseOk('F1 [+60 T0.36] [-60 T0.36] T0.72');
    expect(estimateSegments(snow, 5, 6)).toBe(726); // 6·(3^5−1)/2
  });
});

describe('insertStep', () => {
  it('appends when the list has no trailing self-call', () => {
    const program = parseOk('F1 +20');
    insertStep(program.steps, { kind: 'draw', scale: 0.5 });
    expect(serializeFormula(program)).toBe('F1 +20 F0.5');
  });

  it('inserts a new step before the trailing self-call', () => {
    const program = parseOk('F1 +20 T0.8');
    insertStep(program.steps, { kind: 'draw', scale: 0.5 });
    expect(serializeFormula(program)).toBe('F1 +20 F0.5 T0.8');
  });

  it('inserts before a run of trailing self-calls', () => {
    const program = parseOk('F1 T0.7 T0.5');
    insertStep(program.steps, { kind: 'turn', degrees: 30 });
    expect(serializeFormula(program)).toBe('F1 +30 T0.7 T0.5');
  });

  it('still appends a new self-call at the very end', () => {
    const program = parseOk('F1 T0.7');
    insertStep(program.steps, { kind: 'recurse', scale: 0.5 });
    expect(serializeFormula(program)).toBe('F1 T0.7 T0.5');
  });

  it('inserts a branch group before the trailing self-call', () => {
    const program = parseOk('F1 T0.6');
    insertStep(program.steps, {
      kind: 'group',
      steps: [
        { kind: 'turn', degrees: 30 },
        { kind: 'recurse', scale: 0.7 },
      ],
    });
    expect(serializeFormula(program)).toBe('F1 [+30 T0.7] T0.6');
  });

  it('treats only the trailing run as protected — a mid-list self-call stays put', () => {
    const program = parseOk('T0.7 F1');
    insertStep(program.steps, { kind: 'draw', scale: 0.5 });
    expect(serializeFormula(program)).toBe('T0.7 F1 F0.5');
  });
});
