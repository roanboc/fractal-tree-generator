// Web-layer UI adapter — builds the control panel and reads user input from
// the DOM. Purely presentational: no drawing or fractal math lives here.

import { FractalParams } from '../../core/domain/types';

interface SliderSpec {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  format?: (v: number) => string;
}

const SLIDERS: { section: string; items: SliderSpec[] }[] = [
  {
    section: 'Shape',
    items: [
      { id: 'depth', label: 'Iterations', min: 1, max: 12, step: 1, value: 8 },
      {
        id: 'angle',
        label: 'Branch angle',
        min: 1,
        max: 90,
        step: 1,
        value: 26,
        format: (v) => `${v}°`,
      },
      {
        id: 'lengthFactor',
        label: 'Shrink per level',
        min: 0.1,
        max: 0.9,
        step: 0.01,
        value: 0.72,
        format: (v) => `×${v.toFixed(2)}`,
      },
      {
        id: 'trunkLength',
        label: 'Trunk length',
        min: 10,
        max: 500,
        step: 5,
        value: 140,
        format: (v) => `${v}px`,
      },
    ],
  },
  {
    section: 'Style',
    items: [
      {
        id: 'lineWidth',
        label: 'Trunk thickness',
        min: 1,
        max: 20,
        step: 0.5,
        value: 10,
        format: (v) => `${v}px`,
      },
    ],
  },
  {
    section: 'Life',
    items: [
      {
        id: 'randomness',
        label: 'Wildness',
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.22,
        format: (v) => `${Math.round(v * 100)}%`,
      },
      {
        id: 'animationSpeed',
        label: 'Growth delay',
        min: 0,
        max: 200,
        step: 5,
        value: 0,
        format: (v) => (v === 0 ? 'instant' : `${v}ms`),
      },
    ],
  },
];

const COLOR_INPUTS = [
  { id: 'trunkColor', label: 'Trunk', value: '#a86a33' },
  { id: 'leafColor', label: 'Leaves', value: '#34d399' },
];

function getSliderValue(sliderId: string): number {
  const slider = document.getElementById(sliderId) as HTMLInputElement | null;
  return slider ? parseFloat(slider.value) : 0;
}

function getColorValue(inputId: string, fallback: string): string {
  const input = document.getElementById(inputId) as HTMLInputElement | null;
  return input ? input.value : fallback;
}

function createSliderRow(spec: SliderSpec, onChange: () => void): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'flex flex-col gap-1.5';

  const label = document.createElement('label');
  label.htmlFor = spec.id;
  label.className = 'control-label';

  const name = document.createElement('span');
  name.textContent = spec.label;

  const valueBadge = document.createElement('span');
  valueBadge.id = `${spec.id}-display`;
  valueBadge.className = 'control-value';

  const render = (v: number) => {
    valueBadge.textContent = spec.format ? spec.format(v) : String(v);
  };
  render(spec.value);

  label.appendChild(name);
  label.appendChild(valueBadge);

  const input = document.createElement('input');
  input.type = 'range';
  input.id = spec.id;
  input.className = 'range';
  input.min = String(spec.min);
  input.max = String(spec.max);
  input.step = String(spec.step);
  input.value = String(spec.value);
  input.addEventListener('input', () => render(parseFloat(input.value)));
  input.addEventListener('change', onChange);

  row.appendChild(label);
  row.appendChild(input);
  return row;
}

function createColorRow(onChange: () => void): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'grid grid-cols-2 gap-3';

  for (const spec of COLOR_INPUTS) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col gap-1.5';

    const label = document.createElement('label');
    label.htmlFor = spec.id;
    label.className = 'control-label';
    label.textContent = spec.label;

    const input = document.createElement('input');
    input.type = 'color';
    input.id = spec.id;
    input.className = 'swatch';
    input.value = spec.value;
    input.addEventListener('change', onChange);

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    row.appendChild(wrapper);
  }

  return row;
}

export interface ControlsCallbacks {
  onGenerate: () => void;
  onClear: () => void;
  onDownload: () => void;
  /** Fired when any slider or color input commits a new value. */
  onChange: () => void;
}

export function initializeControls(callbacks: ControlsCallbacks): void {
  const container = document.getElementById('controls');
  if (!container) return;

  container.innerHTML = '';
  container.className = 'flex flex-col gap-6';

  for (const group of SLIDERS) {
    const section = document.createElement('div');
    section.className = 'flex flex-col gap-4';

    const title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = group.section;
    section.appendChild(title);

    for (const spec of group.items) {
      section.appendChild(createSliderRow(spec, callbacks.onChange));
    }

    if (group.section === 'Style') {
      section.appendChild(createColorRow(callbacks.onChange));
    }

    container.appendChild(section);
  }

  const actions = document.createElement('div');
  actions.className = 'mt-2 flex flex-col gap-2.5 border-t border-white/10 pt-5';

  const generateBtn = document.createElement('button');
  generateBtn.id = 'generateButton';
  generateBtn.className = 'btn-primary w-full';
  generateBtn.textContent = '🌱 Generate';
  generateBtn.addEventListener('click', callbacks.onGenerate);

  const secondaryRow = document.createElement('div');
  secondaryRow.className = 'grid grid-cols-2 gap-2.5';

  const clearBtn = document.createElement('button');
  clearBtn.id = 'clearButton';
  clearBtn.className = 'btn-ghost';
  clearBtn.textContent = 'Clear';
  clearBtn.addEventListener('click', callbacks.onClear);

  const downloadBtn = document.createElement('button');
  downloadBtn.id = 'downloadButton';
  downloadBtn.className = 'btn-outline-warm';
  downloadBtn.textContent = 'Save PNG';
  downloadBtn.addEventListener('click', callbacks.onDownload);

  secondaryRow.appendChild(clearBtn);
  secondaryRow.appendChild(downloadBtn);
  actions.appendChild(generateBtn);
  actions.appendChild(secondaryRow);
  container.appendChild(actions);
}

export function getUserInput(): Partial<FractalParams> {
  return {
    depth: getSliderValue('depth'),
    angle: getSliderValue('angle'),
    lengthFactor: getSliderValue('lengthFactor'),
    trunkLength: getSliderValue('trunkLength'),
    lineWidth: getSliderValue('lineWidth'),
    randomness: getSliderValue('randomness'),
    animationSpeed: getSliderValue('animationSpeed'),
    colors: {
      trunk: getColorValue('trunkColor', '#a86a33'),
      leaf: getColorValue('leafColor', '#34d399'),
      accent: '#fbbf24',
    },
  };
}
