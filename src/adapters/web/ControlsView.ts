// Web-layer UI adapter — builds controls and reads user input from the DOM.
// Bug fixed: exports initializeControls and getUserInput that app.ts depends on.

import { FractalParams } from '../../core/domain/types';

export function getSliderValue(sliderId: string): number {
  const slider = document.getElementById(sliderId) as HTMLInputElement | null;
  return slider ? parseFloat(slider.value) : 0;
}

export function updateDisplayValue(displayId: string, value: string | number): void {
  const display = document.getElementById(displayId);
  if (display) display.textContent = String(value);
}

export function attachEventListeners(buttonId: string, callback: () => void): void {
  const button = document.getElementById(buttonId);
  if (button) button.addEventListener('click', callback);
}

export function attachSliderChangeListener(
  sliderId: string,
  callback: (val: number) => void
): void {
  const slider = document.getElementById(sliderId);
  if (slider) {
    slider.addEventListener('input', () => callback(getSliderValue(sliderId)));
  }
}

function createSlider(
  id: string,
  label: string,
  min: number,
  max: number,
  step: number,
  value: number
): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-col items-start mb-2';

  const labelEl = document.createElement('label');
  labelEl.htmlFor = id;
  labelEl.textContent = `${label}: `;
  labelEl.className = 'text-sm font-medium';

  const displaySpan = document.createElement('span');
  displaySpan.id = `${id}-display`;
  displaySpan.textContent = String(value);
  displaySpan.className = 'ml-1 font-bold';
  labelEl.appendChild(displaySpan);

  const input = document.createElement('input');
  input.type = 'range';
  input.id = id;
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.className = 'w-48';
  input.addEventListener('input', () => {
    displaySpan.textContent = input.value;
  });

  wrapper.appendChild(labelEl);
  wrapper.appendChild(input);
  return wrapper;
}

export function initializeControls(): void {
  const container = document.getElementById('controls');
  if (!container) return;

  container.innerHTML = '';
  container.className = 'mt-4 grid grid-cols-2 gap-4 p-4 bg-white rounded shadow';

  container.appendChild(createSlider('depth', 'Depth', 1, 12, 1, 7));
  container.appendChild(createSlider('angle', 'Angle (°)', 1, 90, 1, 30));
  container.appendChild(createSlider('lengthFactor', 'Length Factor', 0.1, 0.9, 0.01, 0.7));
  container.appendChild(createSlider('trunkLength', 'Trunk Length', 10, 500, 5, 120));
  container.appendChild(createSlider('lineWidth', 'Line Width', 1, 20, 0.5, 4));
  container.appendChild(createSlider('randomness', 'Randomness', 0, 1, 0.01, 0));
  container.appendChild(createSlider('animationSpeed', 'Speed (ms)', 0, 2000, 10, 0));

  const buttonRow = document.createElement('div');
  buttonRow.className = 'col-span-2 flex gap-4 mt-2';

  const generateBtn = document.createElement('button');
  generateBtn.id = 'generateButton';
  generateBtn.textContent = 'Generate';
  generateBtn.className = 'px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700';

  const clearBtn = document.createElement('button');
  clearBtn.id = 'clearButton';
  clearBtn.textContent = 'Clear';
  clearBtn.className = 'px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600';

  buttonRow.appendChild(generateBtn);
  buttonRow.appendChild(clearBtn);
  container.appendChild(buttonRow);
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
  };
}
