// Entry point for the "create your own fractal" page (chapter 5).
//
// The canonical state is the program AST. The text box and the visual
// builder both edit it and are kept in sync:
//   text → AST: FormulaBox parses (debounced) and hands over valid programs;
//   AST → text: builder edits serialize back into the box (never while the
//   user is typing there, and invalid text is never rewritten).
// The canvas always renders the last valid program.

import { composeTurtleServices } from '../../composition/WebComposition';
import {
  estimateSegments,
  parseFormula,
  serializeFormula,
  validateProgram,
} from '../../core/application/turtle/formula';
import { TURTLE_DEFAULTS } from '../../core/application/TurtleFractalService';
import { TurtleProgram } from '../../core/domain/turtle';
import { initChrome } from './chrome';
import {
  createActionButtons,
  createColorInput,
  createScalarRow,
  createSection,
  ScalarSpec,
} from './controls/widgets';
import { t } from './i18n';
import { createFormulaBox } from './rulebuilder/FormulaBox';
import { createRuleBuilder } from './rulebuilder/RuleBuilderView';
import { createSerialRunner } from './serialRunner';
import { getCanvasBackground } from './theme';

interface Preset {
  id: string;
  formula: string;
  depth: number;
  symmetry: number;
  origin: 'bottom-center' | 'center';
  size: number;
}

// Known fractals expressible in the little language — starting points to
// load, tweak and learn from.
const PRESETS: Preset[] = [
  {
    id: 'tree',
    formula: 'F1 [+25 T0.7] [-25 T0.7]',
    depth: 7,
    symmetry: 1,
    origin: 'bottom-center',
    size: 130,
  },
  {
    id: 'snowflake',
    formula: 'F1 [+60 T0.36] [-60 T0.36] T0.72',
    depth: 5,
    symmetry: 6,
    origin: 'center',
    size: 110,
  },
  {
    id: 'fern',
    formula: 'F1 [+45 T0.5] F0.6 [-45 T0.5] T0.8',
    depth: 6,
    symmetry: 1,
    origin: 'bottom-center',
    size: 55,
  },
  {
    id: 'crystal',
    formula: 'F1 [+90 F0.35] [-90 F0.35] T0.8',
    depth: 6,
    symmetry: 4,
    origin: 'center',
    size: 80,
  },
  {
    id: 'spiral',
    formula: 'F1 +20 T0.9',
    depth: 8,
    symmetry: 8,
    origin: 'center',
    size: 70,
  },
  {
    id: 'bush',
    formula: 'F0.6 [+35 T0.6] F0.4 [-35 T0.6] T0.6',
    depth: 6,
    symmetry: 1,
    origin: 'bottom-center',
    size: 150,
  },
];

interface CreateOptions {
  depth: number;
  symmetry: number;
  size: number;
  jitter: number;
  animationSpeed: number;
  origin: 'bottom-center' | 'center';
  mainColor: string;
  tipColor: string;
}

const DEFAULT_COLORS = { main: '#34d399', tip: '#fbbf24' };

function mustParse(formula: string): TurtleProgram {
  const result = parseFormula(formula);
  if (!result.ok) throw new Error(`invalid preset formula: ${formula}`);
  return result.program;
}

function optionsFor(preset: Preset): CreateOptions {
  return {
    depth: preset.depth,
    symmetry: preset.symmetry,
    size: preset.size,
    jitter: 0,
    animationSpeed: 0,
    origin: preset.origin,
    mainColor: DEFAULT_COLORS.main,
    tipColor: DEFAULT_COLORS.tip,
  };
}

function init(): void {
  initChrome();

  const canvas = document.getElementById('createCanvas') as HTMLCanvasElement | null;
  const controlsHost = document.getElementById('controls');
  const formulaHost = document.getElementById('formula-box');
  const builderHost = document.getElementById('rule-builder');
  const presetSelect = document.getElementById('preset-select') as HTMLSelectElement | null;
  const estimateEl = document.getElementById('estimate');
  if (!canvas || !controlsHost || !formulaHost || !builderHost || !presetSelect || !estimateEl) {
    return;
  }

  const canvasConfig = { width: 880, height: 640, backgroundColor: getCanvasBackground() };
  const { turtleService, rendererService, speedControlService } = composeTurtleServices(
    canvas,
    canvasConfig
  );

  let activePreset = PRESETS[0];
  let program = mustParse(activePreset.formula);
  let lastValid = structuredClone(program);
  let options = optionsFor(activePreset);
  let lastTruncated = false;

  const generate = createSerialRunner(async () => {
    canvasConfig.backgroundColor = getCanvasBackground();
    speedControlService.setDelay(options.animationSpeed);
    const result = await turtleService.run(lastValid, {
      depth: options.depth,
      symmetry: options.symmetry,
      baseLength: options.size,
      jitter: options.jitter,
      origin: options.origin,
      colors: { main: options.mainColor, tip: options.tipColor },
      animationSpeed: options.animationSpeed,
      strokeDuration: 0,
    });
    lastTruncated = result.truncated;
    refreshEstimate();
  });

  // ── Live segment estimate + truncation warning ────────────────────
  function refreshEstimate(): void {
    const estimate = estimateSegments(program, options.depth, options.symmetry);
    let text = t('create.estimate', { n: estimate.toLocaleString() });
    if (estimate > TURTLE_DEFAULTS.maxSegments || lastTruncated) {
      text += ` · ${t('create.estimate.trim', { max: TURTLE_DEFAULTS.maxSegments.toLocaleString() })}`;
    }
    estimateEl!.textContent = text;
    estimateEl!.classList.toggle(
      'estimate-warn',
      estimate > TURTLE_DEFAULTS.maxSegments || lastTruncated
    );
  }

  // ── Two-way sync plumbing ──────────────────────────────────────────
  const box = createFormulaBox(formulaHost, {
    onProgram(next) {
      // parseFormula only hands over fully valid programs.
      program = next;
      lastValid = structuredClone(next);
      markCustom();
      builder.render();
      refreshEstimate();
      void generate();
    },
  });

  const builder = createRuleBuilder(
    builderHost,
    () => program,
    () => {
      box.setText(serializeFormula(program));
      markCustom();
      const errors = validateProgram(program);
      if (errors.length > 0) {
        box.showErrors(errors);
      } else {
        box.clearErrors();
        lastValid = structuredClone(program);
        void generate();
      }
      refreshEstimate();
    }
  );

  // ── Presets ────────────────────────────────────────────────────────
  function renderPresetOptions(): void {
    const current = presetSelect!.value;
    presetSelect!.innerHTML = '';
    const custom = document.createElement('option');
    custom.value = 'custom';
    custom.textContent = t('create.preset.custom');
    presetSelect!.appendChild(custom);
    for (const preset of PRESETS) {
      const option = document.createElement('option');
      option.value = preset.id;
      option.textContent = t(`create.preset.${preset.id}`);
      presetSelect!.appendChild(option);
    }
    presetSelect!.value = current || 'custom';
  }

  function markCustom(): void {
    presetSelect!.value = 'custom';
  }

  function loadPreset(preset: Preset): void {
    activePreset = preset;
    program = mustParse(preset.formula);
    lastValid = structuredClone(program);
    options = { ...optionsFor(preset), mainColor: options.mainColor, tipColor: options.tipColor };
    lastTruncated = false;
    box.setText(preset.formula, true);
    box.clearErrors();
    builder.render();
    renderPanel();
    refreshEstimate();
    presetSelect!.value = preset.id;
    void generate();
  }

  presetSelect.addEventListener('change', () => {
    const preset = PRESETS.find((p) => p.id === presetSelect.value);
    if (preset) loadPreset(preset);
  });

  // ── Options panel ──────────────────────────────────────────────────
  const onOptionChange = (): void => {
    refreshEstimate();
    void generate();
  };

  type NumericOption = 'depth' | 'symmetry' | 'size' | 'jitter' | 'animationSpeed';
  const slider = (
    spec: Omit<ScalarSpec, 'labelKey' | 'helpKey'> & { id: NumericOption }
  ): HTMLElement =>
    createScalarRow(
      { ...spec, labelKey: `control.cf.${spec.id}`, helpKey: `help.cf.${spec.id}` },
      () => options[spec.id],
      (v) => {
        options[spec.id] = v;
      },
      onOptionChange
    );

  function originRow(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col gap-1.5';
    const label = document.createElement('label');
    label.className = 'control-label';
    label.htmlFor = 'origin-select';
    label.textContent = t('control.cf.origin');
    const select = document.createElement('select');
    select.id = 'origin-select';
    select.className = 'rule-add';
    for (const value of ['bottom-center', 'center'] as const) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = t(
        value === 'bottom-center' ? 'create.origin.bottom' : 'create.origin.center'
      );
      select.appendChild(option);
    }
    select.value = options.origin;
    select.addEventListener('change', () => {
      options.origin = select.value as CreateOptions['origin'];
      onOptionChange();
    });
    wrapper.appendChild(label);
    wrapper.appendChild(select);
    return wrapper;
  }

  function colorGrid(): HTMLElement {
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 gap-3';
    grid.appendChild(
      createColorInput(
        'cf-main-color',
        'color.cf.main',
        () => options.mainColor,
        (v) => {
          options.mainColor = v;
        },
        onOptionChange
      )
    );
    grid.appendChild(
      createColorInput(
        'cf-tip-color',
        'color.tip',
        () => options.tipColor,
        (v) => {
          options.tipColor = v;
        },
        onOptionChange
      )
    );
    return grid;
  }

  function renderPanel(): void {
    controlsHost!.innerHTML = '';
    controlsHost!.className = 'flex flex-col gap-6';

    controlsHost!.appendChild(
      createSection('section.shape', 'section.cf.shape.note', [
        slider({ id: 'depth', min: 1, max: 8, step: 1 }),
        slider({ id: 'symmetry', min: 1, max: 12, step: 1, format: (v) => `×${v}` }),
        slider({ id: 'size', min: 20, max: 260, step: 5, format: (v) => `${v}px` }),
        originRow(),
      ])
    );
    controlsHost!.appendChild(createSection('section.style', undefined, [colorGrid()]));
    controlsHost!.appendChild(
      createSection('section.life', undefined, [
        slider({
          id: 'jitter',
          min: 0,
          max: 0.3,
          step: 0.01,
          format: (v) => `${Math.round(v * 100)}%`,
        }),
        slider({
          id: 'animationSpeed',
          min: 0,
          max: 30,
          step: 1,
          format: (v) => (v === 0 ? t('value.instant') : `${v}ms`),
        }),
      ])
    );

    controlsHost!.appendChild(
      createActionButtons(
        {
          onGenerate: () => void generate(),
          onReset: () => loadPreset(activePreset),
          onClear: () => turtleService.clear(),
          onDownload: () => rendererService.save('').catch(console.error),
        },
        'btn.draw'
      )
    );
  }

  // ── Boot ───────────────────────────────────────────────────────────
  renderPresetOptions();
  presetSelect.value = activePreset.id;
  box.setText(activePreset.formula, true);
  builder.render();
  renderPanel();
  refreshEstimate();

  window.addEventListener('ftree:themechange', () => void generate());
  window.addEventListener('ftree:langchange', () => {
    renderPresetOptions();
    builder.render();
    renderPanel();
    box.rerender();
    refreshEstimate();
  });

  void generate();
}

window.addEventListener('DOMContentLoaded', init);
