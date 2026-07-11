// Web-layer UI adapter — builds the control panel and reads user input from
// the DOM. Purely presentational: no drawing or fractal math lives here.
//
// The panel is state-driven: current values live in a plain object so the
// DOM can be rebuilt at any time (language switch, reset) without losing
// the user's settings.

import { FractalParams, FractalParamsInput, Interval } from '../../core/domain/types';
import { t } from './i18n';

interface ControlsState {
  depth: Interval;
  angle: Interval;
  lengthFactor: Interval;
  trunkLength: number;
  lineWidth: number;
  randomness: number;
  animationSpeed: number;
  trunkColor: string;
  leafColor: string;
}

type IntervalKey = 'depth' | 'angle' | 'lengthFactor';
type ScalarKey = 'trunkLength' | 'lineWidth' | 'randomness' | 'animationSpeed';

interface ControlSpec {
  id: IntervalKey | ScalarKey;
  kind: 'interval' | 'scalar';
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
}

interface SectionSpec {
  titleKey: string;
  noteKey?: string;
  items: ControlSpec[];
  withColors?: boolean;
}

const SECTIONS: SectionSpec[] = [
  {
    titleKey: 'section.shape',
    noteKey: 'section.shape.note',
    items: [
      { id: 'depth', kind: 'interval', min: 1, max: 12, step: 1 },
      { id: 'angle', kind: 'interval', min: 1, max: 90, step: 1, format: (v) => `${v}°` },
      {
        id: 'lengthFactor',
        kind: 'interval',
        min: 0.1,
        max: 0.9,
        step: 0.01,
        format: (v) => `×${v.toFixed(2)}`,
      },
      { id: 'trunkLength', kind: 'scalar', min: 10, max: 500, step: 5, format: (v) => `${v}px` },
    ],
  },
  {
    titleKey: 'section.style',
    items: [
      { id: 'lineWidth', kind: 'scalar', min: 1, max: 20, step: 0.5, format: (v) => `${v}px` },
    ],
    withColors: true,
  },
  {
    titleKey: 'section.life',
    items: [
      {
        id: 'randomness',
        kind: 'scalar',
        min: 0,
        max: 1,
        step: 0.01,
        format: (v) => `${Math.round(v * 100)}%`,
      },
      {
        id: 'animationSpeed',
        kind: 'scalar',
        min: 0,
        max: 200,
        step: 5,
        format: (v) => (v === 0 ? t('value.instant') : `${v}ms`),
      },
    ],
  },
];

let state: ControlsState;
let defaultsState: ControlsState;
let activeCallbacks: ControlsCallbacks;

function toState(params: FractalParams): ControlsState {
  return {
    depth: { ...params.depth },
    angle: { ...params.angle },
    lengthFactor: { ...params.lengthFactor },
    trunkLength: params.trunkLength,
    lineWidth: params.lineWidth,
    randomness: params.randomness,
    animationSpeed: params.animationSpeed,
    trunkColor: params.colors.trunk,
    leafColor: params.colors.leaf,
  };
}

function cloneState(source: ControlsState): ControlsState {
  return {
    ...source,
    depth: { ...source.depth },
    angle: { ...source.angle },
    lengthFactor: { ...source.lengthFactor },
  };
}

function formatValue(spec: ControlSpec, v: number): string {
  return spec.format ? spec.format(v) : String(v);
}

function createHelpToggle(
  spec: ControlSpec | { id: string },
  helpKey: string
): [HTMLButtonElement, HTMLDivElement] {
  const help = document.createElement('div');
  help.className = 'control-help';
  help.id = `${spec.id}-help`;
  help.hidden = true;
  help.textContent = t(helpKey);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'info-btn';
  btn.textContent = 'i';
  btn.setAttribute('aria-label', t('info.show'));
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', help.id);
  btn.addEventListener('click', () => {
    help.hidden = !help.hidden;
    btn.setAttribute('aria-expanded', String(!help.hidden));
    btn.classList.toggle('info-btn-active', !help.hidden);
  });

  return [btn, help];
}

function createLabelRow(
  spec: ControlSpec,
  badgeText: string
): { row: HTMLDivElement; badge: HTMLSpanElement; help: HTMLDivElement } {
  const row = document.createElement('div');
  row.className = 'control-label';

  const left = document.createElement('span');
  left.className = 'flex items-center gap-1.5';

  const name = document.createElement('span');
  name.textContent = t(`control.${spec.id}`);

  const [infoBtn, help] = createHelpToggle(spec, `help.${spec.id}`);

  left.appendChild(name);
  left.appendChild(infoBtn);

  const badge = document.createElement('span');
  badge.className = 'control-value';
  badge.textContent = badgeText;

  row.appendChild(left);
  row.appendChild(badge);
  return { row, badge, help };
}

function createScalarRow(spec: ControlSpec, onChange: () => void): HTMLDivElement {
  const key = spec.id as ScalarKey;
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-1.5';

  const { row, badge, help } = createLabelRow(spec, formatValue(spec, state[key]));

  const input = document.createElement('input');
  input.type = 'range';
  input.id = spec.id;
  input.className = 'range';
  input.min = String(spec.min);
  input.max = String(spec.max);
  input.step = String(spec.step);
  input.value = String(state[key]);
  input.addEventListener('input', () => {
    state[key] = parseFloat(input.value);
    badge.textContent = formatValue(spec, state[key]);
  });
  input.addEventListener('change', onChange);

  container.appendChild(row);
  container.appendChild(help);
  container.appendChild(input);
  return container;
}

/**
 * Dual-thumb range slider built from two stacked native <input type=range>
 * elements: the track ignores pointer events, the thumbs receive them, so
 * it works with touch as well as mouse without custom drag handling.
 */
function createIntervalRow(spec: ControlSpec, onChange: () => void): HTMLDivElement {
  const key = spec.id as IntervalKey;
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-1.5';

  const badgeText = () => {
    const { min, max } = state[key];
    return min === max
      ? formatValue(spec, min)
      : `${formatValue(spec, min)} – ${formatValue(spec, max)}`;
  };

  const { row, badge, help } = createLabelRow(spec, badgeText());

  const wrapper = document.createElement('div');
  wrapper.className = 'dual-range';

  const track = document.createElement('div');
  track.className = 'dual-track';
  const fill = document.createElement('div');
  fill.className = 'dual-fill';
  track.appendChild(fill);

  const makeThumbInput = (end: 'min' | 'max'): HTMLInputElement => {
    const input = document.createElement('input');
    input.type = 'range';
    input.id = `${spec.id}-${end}`;
    input.min = String(spec.min);
    input.max = String(spec.max);
    input.step = String(spec.step);
    input.value = String(state[key][end]);
    return input;
  };

  const minInput = makeThumbInput('min');
  const maxInput = makeThumbInput('max');

  const refresh = () => {
    const span = spec.max - spec.min;
    const lo = ((state[key].min - spec.min) / span) * 100;
    const hi = ((state[key].max - spec.min) / span) * 100;
    fill.style.left = `${lo}%`;
    fill.style.width = `${hi - lo}%`;
    badge.textContent = badgeText();
    // When both thumbs sit at the far right, the min thumb must be on top
    // so the interval can still be reopened by dragging it left.
    const stuckHigh = state[key].min > spec.min + span / 2;
    minInput.style.zIndex = stuckHigh ? '3' : '1';
  };

  minInput.addEventListener('input', () => {
    state[key].min = Math.min(parseFloat(minInput.value), state[key].max);
    minInput.value = String(state[key].min);
    refresh();
  });
  maxInput.addEventListener('input', () => {
    state[key].max = Math.max(parseFloat(maxInput.value), state[key].min);
    maxInput.value = String(state[key].max);
    refresh();
  });
  minInput.addEventListener('change', onChange);
  maxInput.addEventListener('change', onChange);

  wrapper.appendChild(track);
  wrapper.appendChild(minInput);
  wrapper.appendChild(maxInput);
  refresh();

  container.appendChild(row);
  container.appendChild(help);
  container.appendChild(wrapper);
  return container;
}

function createColorRows(onChange: () => void): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-1.5';

  const labelRow = document.createElement('div');
  labelRow.className = 'control-label';
  const left = document.createElement('span');
  left.className = 'flex items-center gap-1.5';
  const name = document.createElement('span');
  name.textContent = t('control.colors');
  const [infoBtn, help] = createHelpToggle({ id: 'colors' }, 'help.colors');
  left.appendChild(name);
  left.appendChild(infoBtn);
  labelRow.appendChild(left);

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-2 gap-3';

  const inputs: { key: 'trunkColor' | 'leafColor'; labelKey: string }[] = [
    { key: 'trunkColor', labelKey: 'color.trunk' },
    { key: 'leafColor', labelKey: 'color.leaf' },
  ];

  for (const spec of inputs) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col gap-1.5';

    const label = document.createElement('label');
    label.htmlFor = spec.key;
    label.className = 'control-label';
    label.textContent = t(spec.labelKey);

    const input = document.createElement('input');
    input.type = 'color';
    input.id = spec.key;
    input.className = 'swatch';
    input.value = state[spec.key];
    input.addEventListener('change', () => {
      state[spec.key] = input.value;
      onChange();
    });

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    grid.appendChild(wrapper);
  }

  container.appendChild(labelRow);
  container.appendChild(help);
  container.appendChild(grid);
  return container;
}

export interface ControlsCallbacks {
  onGenerate: () => void;
  onClear: () => void;
  onDownload: () => void;
  /** Fired when any slider or color input commits a new value. */
  onChange: () => void;
}

function render(): void {
  const container = document.getElementById('controls');
  if (!container) return;

  container.innerHTML = '';
  container.className = 'flex flex-col gap-6';

  for (const group of SECTIONS) {
    const section = document.createElement('div');
    section.className = 'flex flex-col gap-4';

    const title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = t(group.titleKey);
    section.appendChild(title);

    if (group.noteKey) {
      const note = document.createElement('p');
      note.className = 'section-note';
      note.textContent = t(group.noteKey);
      section.appendChild(note);
    }

    for (const spec of group.items) {
      section.appendChild(
        spec.kind === 'interval'
          ? createIntervalRow(spec, activeCallbacks.onChange)
          : createScalarRow(spec, activeCallbacks.onChange)
      );
    }

    if (group.withColors) {
      section.appendChild(createColorRows(activeCallbacks.onChange));
    }

    container.appendChild(section);
  }

  const actions = document.createElement('div');
  actions.className = 'actions-block mt-2 flex flex-col gap-2.5 pt-5';

  const generateBtn = document.createElement('button');
  generateBtn.id = 'generateButton';
  generateBtn.className = 'btn-primary w-full';
  generateBtn.textContent = t('btn.generate');
  generateBtn.addEventListener('click', activeCallbacks.onGenerate);

  const resetBtn = document.createElement('button');
  resetBtn.id = 'resetButton';
  resetBtn.className = 'btn-ghost w-full';
  resetBtn.textContent = t('btn.reset');
  resetBtn.addEventListener('click', () => {
    state = cloneState(defaultsState);
    render();
    activeCallbacks.onChange();
  });

  const secondaryRow = document.createElement('div');
  secondaryRow.className = 'grid grid-cols-2 gap-2.5';

  const clearBtn = document.createElement('button');
  clearBtn.id = 'clearButton';
  clearBtn.className = 'btn-ghost';
  clearBtn.textContent = t('btn.clear');
  clearBtn.addEventListener('click', activeCallbacks.onClear);

  const downloadBtn = document.createElement('button');
  downloadBtn.id = 'downloadButton';
  downloadBtn.className = 'btn-outline-warm';
  downloadBtn.textContent = t('btn.download');
  downloadBtn.addEventListener('click', activeCallbacks.onDownload);

  secondaryRow.appendChild(clearBtn);
  secondaryRow.appendChild(downloadBtn);
  actions.appendChild(generateBtn);
  actions.appendChild(resetBtn);
  actions.appendChild(secondaryRow);
  container.appendChild(actions);
}

export function initializeControls(callbacks: ControlsCallbacks, defaults: FractalParams): void {
  activeCallbacks = callbacks;
  defaultsState = toState(defaults);
  state = cloneState(defaultsState);
  render();
}

/** Rebuild the panel in the current language, keeping the user's values. */
export function rerenderControls(): void {
  if (!state) return;
  render();
}

export function getUserInput(): FractalParamsInput {
  return {
    depth: { ...state.depth },
    angle: { ...state.angle },
    lengthFactor: { ...state.lengthFactor },
    trunkLength: state.trunkLength,
    lineWidth: state.lineWidth,
    randomness: state.randomness,
    animationSpeed: state.animationSpeed,
    colors: {
      trunk: state.trunkColor,
      leaf: state.leafColor,
      accent: '#fbbf24',
    },
  };
}
