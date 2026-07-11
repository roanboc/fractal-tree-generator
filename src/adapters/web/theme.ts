// Light/dark theme handling. First visit follows the device preference;
// the header toggle overrides it and the override is remembered.

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'ftree-theme';

const CANVAS_BACKGROUND: Record<Theme, string> = {
  dark: '#0b1020',
  light: '#eef3f8',
};

let currentTheme: Theme = 'dark';

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function initTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  currentTheme = stored === 'light' || stored === 'dark' ? stored : systemTheme();
  applyTheme(currentTheme);
  return currentTheme;
}

export function getTheme(): Theme {
  return currentTheme;
}

export function toggleTheme(): Theme {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(STORAGE_KEY, currentTheme);
  applyTheme(currentTheme);
  window.dispatchEvent(new CustomEvent('ftree:themechange', { detail: { theme: currentTheme } }));
  return currentTheme;
}

/** Background color the drawing canvases should use for the active theme. */
export function getCanvasBackground(): string {
  return CANVAS_BACKGROUND[currentTheme];
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}
