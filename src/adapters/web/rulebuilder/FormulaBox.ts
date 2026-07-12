// The text half of the two-way formula sync: a textarea the user can type
// turtle formulas into, with debounced parsing and positioned error messages.
//
// Sync rules (see create.ts): builder edits overwrite this text — but never
// while the user is typing in it — and invalid text is never rewritten; the
// canvas simply keeps the last valid fractal until the formula parses again.

import { FormulaError, parseFormula } from '../../../core/application/turtle/formula';
import { TurtleProgram } from '../../../core/domain/turtle';
import { t } from '../i18n';

const PARSE_DEBOUNCE_MS = 300;

export interface FormulaBoxCallbacks {
  /** Fired whenever the text parses into a (syntactically) valid program. */
  onProgram(program: TurtleProgram): void;
}

export interface FormulaBox {
  /** Replace the text (skipped while the textarea has focus, unless forced). */
  setText(text: string, force?: boolean): void;
  getText(): string;
  /** Show semantic errors coming from outside the box (builder edits). */
  showErrors(errors: FormulaError[]): void;
  clearErrors(): void;
  /** Re-render translated bits (error messages) after a language switch. */
  rerender(): void;
}

function lineCol(source: string, position: number): { line: number; col: number } {
  const before = source.slice(0, position);
  const line = before.split('\n').length;
  const col = position - before.lastIndexOf('\n');
  return { line, col };
}

export function createFormulaBox(host: HTMLElement, callbacks: FormulaBoxCallbacks): FormulaBox {
  const textarea = document.createElement('textarea');
  textarea.id = 'formula-input';
  textarea.className = 'formula-textarea';
  textarea.rows = 3;
  textarea.spellcheck = false;
  textarea.setAttribute('aria-label', 'Fractal formula');

  const errorList = document.createElement('ul');
  errorList.className = 'formula-errors';
  errorList.hidden = true;

  host.appendChild(textarea);
  host.appendChild(errorList);

  let currentErrors: FormulaError[] = [];
  let debounce: ReturnType<typeof setTimeout> | undefined;

  const renderErrors = (): void => {
    errorList.innerHTML = '';
    errorList.hidden = currentErrors.length === 0;
    textarea.classList.toggle('formula-textarea-invalid', currentErrors.length > 0);
    for (const error of currentErrors) {
      const item = document.createElement('li');
      const { line, col } = lineCol(textarea.value, error.position);
      const detail = error.detail ? ` (${error.detail})` : '';
      item.textContent = `⚠ ${line}:${col} — ${t(`dsl.err.${error.code}`)}${detail}`;
      errorList.appendChild(item);
    }
  };

  const parseNow = (): void => {
    const result = parseFormula(textarea.value);
    if (result.ok) {
      currentErrors = [];
      renderErrors();
      callbacks.onProgram(result.program);
    } else {
      currentErrors = result.errors;
      renderErrors();
    }
  };

  textarea.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(parseNow, PARSE_DEBOUNCE_MS);
  });
  textarea.addEventListener('blur', () => {
    clearTimeout(debounce);
    parseNow();
  });
  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      clearTimeout(debounce);
      parseNow();
    }
  });

  return {
    setText(text, force = false) {
      if (!force && document.activeElement === textarea) return;
      textarea.value = text;
    },
    getText: () => textarea.value,
    showErrors(errors) {
      currentErrors = errors;
      renderErrors();
    },
    clearErrors() {
      currentErrors = [];
      renderErrors();
    },
    rerender: renderErrors,
  };
}
