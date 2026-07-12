// Control panel for the snowflake page — deliberately simpler than the tree
// panel: a handful of single-value sliders, two colors, and the action
// buttons, all composed from the shared widgets.

import { SnowflakeParams } from '../../core/domain/snowflake';
import {
  createActionButtons,
  createColorInput,
  createScalarRow,
  createSection,
  ScalarSpec,
} from './controls/widgets';
import { t } from './i18n';

export interface SnowflakeControlsCallbacks {
  onGenerate: () => void;
  onClear: () => void;
  onDownload: () => void;
  /** Fired when any slider or color input commits a new value. */
  onChange: () => void;
}

export interface SnowflakeControls {
  getParams(): Partial<SnowflakeParams>;
  /** Rebuild the panel in the current language, keeping the user's values. */
  rerender(): void;
}

type SliderKey =
  'depth' | 'branchAngle' | 'sideScale' | 'spineScale' | 'size' | 'jitter' | 'animationSpeed';

const SLIDERS: (Omit<ScalarSpec, 'labelKey' | 'helpKey'> & { id: SliderKey })[] = [
  { id: 'depth', min: 2, max: 6, step: 1 },
  { id: 'branchAngle', min: 40, max: 80, step: 1, format: (v) => `${v}°` },
  { id: 'sideScale', min: 0.2, max: 0.55, step: 0.01, format: (v) => `×${v.toFixed(2)}` },
  { id: 'spineScale', min: 0.55, max: 0.85, step: 0.01, format: (v) => `×${v.toFixed(2)}` },
  { id: 'size', min: 40, max: 260, step: 5, format: (v) => `${v}px` },
];

const LIFE_SLIDERS: (Omit<ScalarSpec, 'labelKey' | 'helpKey'> & { id: SliderKey })[] = [
  { id: 'jitter', min: 0, max: 0.15, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
  {
    id: 'animationSpeed',
    min: 0,
    max: 30,
    step: 1,
    format: (v) => (v === 0 ? t('value.instant') : `${v}ms`),
  },
];

export function createSnowflakeControls(
  container: HTMLElement,
  callbacks: SnowflakeControlsCallbacks,
  defaults: SnowflakeParams
): SnowflakeControls {
  const defaultsState = { ...defaults };
  let state = { ...defaults };

  const slider = (spec: (typeof SLIDERS)[number]): HTMLElement =>
    createScalarRow(
      {
        ...spec,
        labelKey: `control.sf.${spec.id}`,
        helpKey: `help.sf.${spec.id}`,
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
        'sf-color',
        'color.arm',
        () => state.color,
        (v) => {
          state.color = v;
        },
        callbacks.onChange
      )
    );
    grid.appendChild(
      createColorInput(
        'sf-tip-color',
        'color.tip',
        () => state.tipColor,
        (v) => {
          state.tipColor = v;
        },
        callbacks.onChange
      )
    );
    return grid;
  };

  const render = (): void => {
    container.innerHTML = '';
    container.className = 'flex flex-col gap-6';

    container.appendChild(
      createSection('section.shape', 'section.sf.shape.note', SLIDERS.map(slider))
    );
    container.appendChild(createSection('section.style', undefined, [colorGrid()]));
    container.appendChild(createSection('section.life', undefined, LIFE_SLIDERS.map(slider)));

    container.appendChild(
      createActionButtons(
        {
          onGenerate: callbacks.onGenerate,
          onReset: () => {
            state = { ...defaultsState };
            render();
            callbacks.onChange();
          },
          onClear: callbacks.onClear,
          onDownload: callbacks.onDownload,
        },
        'btn.crystallize'
      )
    );
  };

  render();

  return {
    getParams: () => ({ ...state }),
    rerender: render,
  };
}
