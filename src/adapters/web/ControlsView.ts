// Web-layer UI adapter — builds the tree generator's control panel and reads
// user input from the DOM. Purely presentational: no drawing or fractal math
// lives here. Shared row widgets live in controls/widgets.ts; this module
// keeps the tree-specific parts (interval sliders, panel state).
//
// The panel is state-driven: current values live in a plain object so the
// DOM can be rebuilt at any time (language switch, reset) without losing
// the user's settings.

import { FractalParams, FractalParamsInput, Interval } from '../../core/domain/types';
import {
  createActionButtons,
  createColorInput,
  createHelpToggle,
  createLabelRow,
  createScalarRow,
  createSection,
  formatValue,
} from './controls/widgets';
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

  const { row, badge, help } = createLabelRow(
    spec.id,
    `control.${spec.id}`,
    `help.${spec.id}`,
    badgeText()
  );

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
  const [infoBtn, help] = createHelpToggle('colors', 'help.colors');
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
    grid.appendChild(
      createColorInput(
        spec.key,
        spec.labelKey,
        () => state[spec.key],
        (v) => {
          state[spec.key] = v;
        },
        onChange
      )
    );
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
    const rows: HTMLElement[] = group.items.map((spec) =>
      spec.kind === 'interval'
        ? createIntervalRow(spec, activeCallbacks.onChange)
        : createScalarRow(
            {
              id: spec.id,
              labelKey: `control.${spec.id}`,
              helpKey: `help.${spec.id}`,
              min: spec.min,
              max: spec.max,
              step: spec.step,
              format: spec.format,
            },
            () => state[spec.id as ScalarKey],
            (v) => {
              state[spec.id as ScalarKey] = v;
            },
            activeCallbacks.onChange
          )
    );

    if (group.withColors) {
      rows.push(createColorRows(activeCallbacks.onChange));
    }

    container.appendChild(createSection(group.titleKey, group.noteKey, rows));
  }

  container.appendChild(
    createActionButtons({
      onGenerate: activeCallbacks.onGenerate,
      onReset: () => {
        state = cloneState(defaultsState);
        render();
        activeCallbacks.onChange();
      },
      onClear: activeCallbacks.onClear,
      onDownload: activeCallbacks.onDownload,
    })
  );
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
