// Control panel for the 3D tree page — deliberately fewer knobs than the
// chapter-3 tree panel (single-value sliders, no ranges): the chapter's
// payoff is orbiting the shape, not parameter mastery. Composed from the
// shared widgets plus one custom row, the slow-spin toggle.

import { Tree3DParams } from '../../core/domain/tree3d';
import {
  createActionButtons,
  createColorInput,
  createScalarRow,
  createSection,
  ScalarSpec,
} from './controls/widgets';
import { t } from './i18n';

export interface Tree3DControlsCallbacks {
  onGenerate: () => void;
  onClear: () => void;
  onDownload: () => void;
  /** Fired when any slider or color input commits a new value. */
  onChange: () => void;
  onAutoRotate: (enabled: boolean) => void;
}

export interface Tree3DControls {
  getParams(): Partial<Tree3DParams>;
  /** Rebuild the panel in the current language, keeping the user's values. */
  rerender(): void;
}

type SliderKey = 'depth' | 'branches' | 'branchAngle' | 'twist' | 'lengthFactor' | 'wildness';

const SHAPE_SLIDERS: (Omit<ScalarSpec, 'labelKey' | 'helpKey'> & { id: SliderKey })[] = [
  { id: 'depth', min: 2, max: 8, step: 1 },
  { id: 'branches', min: 2, max: 5, step: 1 },
  { id: 'branchAngle', min: 10, max: 70, step: 1, format: (v) => `${v}°` },
  { id: 'twist', min: 0, max: 120, step: 1, format: (v) => `${v}°` },
  { id: 'lengthFactor', min: 0.5, max: 0.8, step: 0.01, format: (v) => `×${v.toFixed(2)}` },
];

const LIFE_SLIDERS: (Omit<ScalarSpec, 'labelKey' | 'helpKey'> & { id: SliderKey })[] = [
  { id: 'wildness', min: 0, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
];

export function createTree3DControls(
  container: HTMLElement,
  callbacks: Tree3DControlsCallbacks,
  defaults: Tree3DParams,
  autoRotateDefault: boolean
): Tree3DControls {
  const defaultsState = { ...defaults, colors: { ...defaults.colors } };
  let state = { ...defaults, colors: { ...defaults.colors } };
  let autoRotate = autoRotateDefault;

  const slider = (spec: (typeof SHAPE_SLIDERS)[number]): HTMLElement =>
    createScalarRow(
      {
        ...spec,
        labelKey: `control.t3.${spec.id}`,
        helpKey: `help.t3.${spec.id}`,
      },
      () => state[spec.id],
      (v) => {
        state[spec.id] = v;
      },
      callbacks.onChange
    );

  const colorGrid = (): HTMLElement => {
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 gap-3';
    grid.appendChild(
      createColorInput(
        't3-trunk-color',
        'color.trunk',
        () => state.colors.trunk,
        (v) => {
          state.colors.trunk = v;
        },
        callbacks.onChange
      )
    );
    grid.appendChild(
      createColorInput(
        't3-leaf-color',
        'color.leaf',
        () => state.colors.leaf,
        (v) => {
          state.colors.leaf = v;
        },
        callbacks.onChange
      )
    );
    return grid;
  };

  const spinRow = (): HTMLElement => {
    const label = document.createElement('label');
    label.className = 'control-label cursor-pointer gap-2';

    const name = document.createElement('span');
    name.textContent = t('tree3d.autorotate');

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 't3-autorotate';
    input.className = 'h-4 w-4 accent-emerald-500';
    input.checked = autoRotate;
    input.addEventListener('change', () => {
      autoRotate = input.checked;
      callbacks.onAutoRotate(autoRotate);
    });

    label.appendChild(name);
    label.appendChild(input);
    return label;
  };

  const render = (): void => {
    container.innerHTML = '';
    container.className = 'flex flex-col gap-6';

    container.appendChild(
      createSection('section.shape', 'section.t3.shape.note', SHAPE_SLIDERS.map(slider))
    );
    container.appendChild(createSection('section.style', undefined, [colorGrid()]));
    container.appendChild(
      createSection('section.life', undefined, [...LIFE_SLIDERS.map(slider), spinRow()])
    );

    container.appendChild(
      createActionButtons(
        {
          onGenerate: callbacks.onGenerate,
          onReset: () => {
            state = { ...defaultsState, colors: { ...defaultsState.colors } };
            render();
            callbacks.onChange();
          },
          onClear: callbacks.onClear,
          onDownload: callbacks.onDownload,
        },
        'btn.grow3d'
      )
    );
  };

  render();

  return {
    getParams: () => ({ ...state, colors: { ...state.colors } }),
    rerender: render,
  };
}
