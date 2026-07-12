// Reusable, state-agnostic control-panel widgets. Rows read and write values
// through getter/setter callbacks so any panel (tree, snowflake, rule
// builder) can bind them to its own state object.

import { t } from '../i18n';

export interface ScalarSpec {
  id: string;
  labelKey: string;
  helpKey: string;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
}

export function formatValue(spec: Pick<ScalarSpec, 'format'>, v: number): string {
  return spec.format ? spec.format(v) : String(v);
}

/** The little "i" button plus its collapsible help box. */
export function createHelpToggle(id: string, helpKey: string): [HTMLButtonElement, HTMLDivElement] {
  const help = document.createElement('div');
  help.className = 'control-help';
  help.id = `${id}-help`;
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

export interface LabelRow {
  row: HTMLDivElement;
  badge: HTMLSpanElement;
  help: HTMLDivElement;
}

/** Label + info toggle on the left, live value badge on the right. */
export function createLabelRow(
  id: string,
  labelKey: string,
  helpKey: string,
  badgeText: string
): LabelRow {
  const row = document.createElement('div');
  row.className = 'control-label';

  const left = document.createElement('span');
  left.className = 'flex items-center gap-1.5';

  const name = document.createElement('span');
  name.textContent = t(labelKey);

  const [infoBtn, help] = createHelpToggle(id, helpKey);

  left.appendChild(name);
  left.appendChild(infoBtn);

  const badge = document.createElement('span');
  badge.className = 'control-value';
  badge.textContent = badgeText;

  row.appendChild(left);
  row.appendChild(badge);
  return { row, badge, help };
}

/** A labelled single-thumb slider bound through get/set callbacks. */
export function createScalarRow(
  spec: ScalarSpec,
  get: () => number,
  set: (v: number) => void,
  onCommit: () => void
): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-1.5';

  const { row, badge, help } = createLabelRow(
    spec.id,
    spec.labelKey,
    spec.helpKey,
    formatValue(spec, get())
  );

  const input = document.createElement('input');
  input.type = 'range';
  input.id = spec.id;
  input.className = 'range';
  input.min = String(spec.min);
  input.max = String(spec.max);
  input.step = String(spec.step);
  input.value = String(get());
  input.addEventListener('input', () => {
    set(parseFloat(input.value));
    badge.textContent = formatValue(spec, get());
  });
  input.addEventListener('change', onCommit);

  container.appendChild(row);
  container.appendChild(help);
  container.appendChild(input);
  return container;
}

/** A labelled color swatch input bound through get/set callbacks. */
export function createColorInput(
  id: string,
  labelKey: string,
  get: () => string,
  set: (v: string) => void,
  onCommit: () => void
): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-col gap-1.5';

  const label = document.createElement('label');
  label.htmlFor = id;
  label.className = 'control-label';
  label.textContent = t(labelKey);

  const input = document.createElement('input');
  input.type = 'color';
  input.id = id;
  input.className = 'swatch';
  input.value = get();
  input.addEventListener('change', () => {
    set(input.value);
    onCommit();
  });

  wrapper.appendChild(label);
  wrapper.appendChild(input);
  return wrapper;
}

export interface ActionCallbacks {
  onGenerate: () => void;
  onReset: () => void;
  onClear: () => void;
  onDownload: () => void;
}

/** Generate / reset / clear / download button block shared by the panels. */
export function createActionButtons(
  callbacks: ActionCallbacks,
  generateLabelKey = 'btn.generate'
): HTMLDivElement {
  const actions = document.createElement('div');
  actions.className = 'actions-block mt-2 flex flex-col gap-2.5 pt-5';

  const generateBtn = document.createElement('button');
  generateBtn.id = 'generateButton';
  generateBtn.className = 'btn-primary w-full';
  generateBtn.textContent = t(generateLabelKey);
  generateBtn.addEventListener('click', callbacks.onGenerate);

  const resetBtn = document.createElement('button');
  resetBtn.id = 'resetButton';
  resetBtn.className = 'btn-ghost w-full';
  resetBtn.textContent = t('btn.reset');
  resetBtn.addEventListener('click', callbacks.onReset);

  const secondaryRow = document.createElement('div');
  secondaryRow.className = 'grid grid-cols-2 gap-2.5';

  const clearBtn = document.createElement('button');
  clearBtn.id = 'clearButton';
  clearBtn.className = 'btn-ghost';
  clearBtn.textContent = t('btn.clear');
  clearBtn.addEventListener('click', callbacks.onClear);

  const downloadBtn = document.createElement('button');
  downloadBtn.id = 'downloadButton';
  downloadBtn.className = 'btn-outline-warm';
  downloadBtn.textContent = t('btn.download');
  downloadBtn.addEventListener('click', callbacks.onDownload);

  secondaryRow.appendChild(clearBtn);
  secondaryRow.appendChild(downloadBtn);
  actions.appendChild(generateBtn);
  actions.appendChild(resetBtn);
  actions.appendChild(secondaryRow);
  return actions;
}

/** Section wrapper: uppercase title, optional note, then the given rows. */
export function createSection(
  titleKey: string,
  noteKey: string | undefined,
  rows: HTMLElement[]
): HTMLDivElement {
  const section = document.createElement('div');
  section.className = 'flex flex-col gap-4';

  const title = document.createElement('h2');
  title.className = 'section-title';
  title.textContent = t(titleKey);
  section.appendChild(title);

  if (noteKey) {
    const note = document.createElement('p');
    note.className = 'section-note';
    note.textContent = t(noteKey);
    section.appendChild(note);
  }

  for (const row of rows) section.appendChild(row);
  return section;
}
