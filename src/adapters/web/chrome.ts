// Shared header wiring for both pages: theme toggle and language switch.

import { getLang, initI18n, setLang, t, translatePage, Lang } from './i18n';
import { getTheme, initTheme, toggleTheme } from './theme';

function refreshThemeButton(): void {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const dark = getTheme() === 'dark';
  btn.textContent = dark ? '☀️' : '🌙';
  btn.setAttribute('aria-label', dark ? t('theme.toLight') : t('theme.toDark'));
  btn.title = dark ? t('theme.toLight') : t('theme.toDark');
}

function refreshLangButtons(): void {
  for (const lang of ['en', 'es'] as Lang[]) {
    const btn = document.getElementById(`lang-${lang}`);
    btn?.classList.toggle('lang-btn-active', getLang() === lang);
  }
}

/**
 * Initialize theme + language and wire the header controls. Call once per
 * page, before rendering any translated dynamic content.
 */
export function initChrome(): void {
  initTheme();
  initI18n();
  translatePage();
  refreshThemeButton();
  refreshLangButtons();

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    toggleTheme();
    refreshThemeButton();
  });

  for (const lang of ['en', 'es'] as Lang[]) {
    document.getElementById(`lang-${lang}`)?.addEventListener('click', () => setLang(lang));
  }

  window.addEventListener('ftree:langchange', () => {
    refreshLangButtons();
    refreshThemeButton();
  });
}
