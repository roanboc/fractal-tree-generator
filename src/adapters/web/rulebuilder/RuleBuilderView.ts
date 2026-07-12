// The visual half of the two-way formula sync: renders the program AST as
// editable rows (draw / move / turn / self-call, with bracketed branches as
// nested boxes) and mutates that same AST in place. create.ts owns the AST
// and keeps the text box in sync after every change.

import { MAX_BRANCHES, TurtleProgram, TurtleStep } from '../../../core/domain/turtle';
import {
  insertStep,
  RECURSE_SCALE_RANGE,
  SCALE_RANGE,
  TURN_RANGE,
} from '../../../core/application/turtle/formula';
import { t } from '../i18n';

export interface RuleBuilder {
  /** Rebuild the rows from the current AST (structure or language changed). */
  render(): void;
}

interface StepIcons {
  icon: string;
  labelKey: string;
}

const STEP_META: Record<Exclude<TurtleStep['kind'], 'group'>, StepIcons> = {
  draw: { icon: '✏️', labelKey: 'create.step.draw' },
  move: { icon: '👣', labelKey: 'create.step.move' },
  turn: { icon: '↪️', labelKey: 'create.step.turn' },
  recurse: { icon: '🔁', labelKey: 'create.step.recurse' },
};

/** What the "add step" menu can insert. */
const ADD_CHOICES: { id: string; make: () => TurtleStep }[] = [
  { id: 'draw', make: () => ({ kind: 'draw', scale: 1 }) },
  { id: 'move', make: () => ({ kind: 'move', scale: 0.5 }) },
  { id: 'turnLeft', make: () => ({ kind: 'turn', degrees: 45 }) },
  { id: 'turnRight', make: () => ({ kind: 'turn', degrees: -45 }) },
  { id: 'faceLeft', make: () => ({ kind: 'turn', degrees: 90 }) },
  { id: 'faceRight', make: () => ({ kind: 'turn', degrees: -90 }) },
  { id: 'recurse', make: () => ({ kind: 'recurse', scale: 0.7 }) },
  {
    id: 'branch',
    make: () => ({
      kind: 'group',
      steps: [
        { kind: 'turn', degrees: 30 },
        { kind: 'recurse', scale: 0.7 },
      ],
    }),
  },
];

export function createRuleBuilder(
  host: HTMLElement,
  getProgram: () => TurtleProgram,
  onChange: () => void
): RuleBuilder {
  function countRecurse(steps: TurtleStep[]): number {
    let n = 0;
    for (const step of steps) {
      if (step.kind === 'recurse') n++;
      else if (step.kind === 'group') n += countRecurse(step.steps);
    }
    return n;
  }

  function numberInput(
    value: number,
    range: { min: number; max: number },
    step: number,
    apply: (v: number) => void
  ): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'rule-number';
    input.min = String(range.min);
    input.max = String(range.max);
    input.step = String(step);
    input.value = String(value);
    input.addEventListener('change', () => {
      const v = parseFloat(input.value);
      if (Number.isNaN(v)) {
        input.value = String(value);
        return;
      }
      apply(v);
      onChange();
    });
    return input;
  }

  function moveButton(list: TurtleStep[], index: number, delta: -1 | 1): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rule-move';
    btn.textContent = delta === -1 ? '▲' : '▼';
    const label = t(delta === -1 ? 'create.step.moveUp' : 'create.step.moveDown');
    btn.title = label;
    btn.setAttribute('aria-label', label);
    const target = index + delta;
    btn.disabled = target < 0 || target >= list.length;
    btn.addEventListener('click', () => {
      [list[index], list[target]] = [list[target], list[index]];
      render();
      onChange();
    });
    return btn;
  }

  function rowControls(list: TurtleStep[], index: number): HTMLElement[] {
    return [moveButton(list, index, -1), moveButton(list, index, 1), deleteButton(list, index)];
  }

  function deleteButton(list: TurtleStep[], index: number): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rule-delete';
    btn.textContent = '✕';
    btn.title = t('create.step.remove');
    btn.setAttribute('aria-label', t('create.step.remove'));
    btn.addEventListener('click', () => {
      list.splice(index, 1);
      render();
      onChange();
    });
    return btn;
  }

  function stepRow(step: TurtleStep, list: TurtleStep[], index: number): HTMLElement {
    if (step.kind === 'group') {
      const box = document.createElement('div');
      box.className = 'rule-group';

      const header = document.createElement('div');
      header.className = 'rule-row';
      const label = document.createElement('span');
      label.className = 'rule-label';
      label.textContent = `🌿 ${t('create.step.branch')}`;
      header.appendChild(label);
      for (const control of rowControls(list, index)) header.appendChild(control);
      box.appendChild(header);

      const children = document.createElement('div');
      children.className = 'rule-children';
      step.steps.forEach((child, i) => children.appendChild(stepRow(child, step.steps, i)));
      children.appendChild(addMenu(step.steps));
      box.appendChild(children);
      return box;
    }

    const row = document.createElement('div');
    row.className = 'rule-row';

    const meta = STEP_META[step.kind];
    const label = document.createElement('span');
    label.className = 'rule-label';
    label.textContent = `${meta.icon} ${t(meta.labelKey)}`;
    row.appendChild(label);

    if (step.kind === 'turn') {
      row.appendChild(
        numberInput(step.degrees, TURN_RANGE, 1, (v) => {
          step.degrees = v;
        })
      );
      const unit = document.createElement('span');
      unit.className = 'rule-unit';
      unit.textContent = '°';
      row.appendChild(unit);
    } else {
      const range = step.kind === 'recurse' ? RECURSE_SCALE_RANGE : SCALE_RANGE;
      row.appendChild(
        numberInput(step.scale, range, 0.05, (v) => {
          step.scale = v;
        })
      );
      const unit = document.createElement('span');
      unit.className = 'rule-unit';
      unit.textContent = `× ${t('create.step.ofLength')}`;
      row.appendChild(unit);
    }

    for (const control of rowControls(list, index)) row.appendChild(control);
    return row;
  }

  function addMenu(list: TurtleStep[]): HTMLElement {
    const select = document.createElement('select');
    select.className = 'rule-add';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = t('create.addStep');
    select.appendChild(placeholder);

    const branchesLeft = countRecurse(getProgram().steps) < MAX_BRANCHES;
    for (const choice of ADD_CHOICES) {
      const usesRecurse = choice.id === 'recurse' || choice.id === 'branch';
      if (usesRecurse && !branchesLeft) continue;
      const option = document.createElement('option');
      option.value = choice.id;
      option.textContent = t(`create.add.${choice.id}`);
      select.appendChild(option);
    }

    select.addEventListener('change', () => {
      const choice = ADD_CHOICES.find((c) => c.id === select.value);
      if (!choice) return;
      // Keep the trailing self-call last — a rule reads "do the steps,
      // then repeat", so additions go before the repeat (see insertStep).
      insertStep(list, choice.make());
      render();
      onChange();
    });
    return select;
  }

  function render(): void {
    host.innerHTML = '';
    const program = getProgram();
    program.steps.forEach((step, i) => host.appendChild(stepRow(step, program.steps, i)));
    host.appendChild(addMenu(program.steps));
  }

  return { render };
}
