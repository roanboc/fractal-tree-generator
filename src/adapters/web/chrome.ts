// Shared page chrome: the header (brand, journey nav, theme + language
// controls), the chapter badge and the prev/next pager are all rendered here
// from the ROUTES list, so every page stays in sync as chapters are added.
// Pages only ship empty shell elements (#site-header, #chapter-badge, #pager).

import { getLang, initI18n, localizeInternalLinks, setLang, t, translatePage, Lang } from './i18n';
import { chapterNumber, currentRoute, ROUTES } from './routes';
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

function renderHeader(): void {
  const header = document.getElementById('site-header');
  if (!header) return;

  const active = currentRoute();
  const navLinks = ROUTES.map(
    (route, i) => `
      <a href="./${route.file}" class="nav-link${route.id === active.id ? ' nav-link-active' : ''}"
        ><span class="nav-num">${i + 1}</span
        ><span class="hidden sm:inline">${t(route.navKey)}</span></a
      >`
  ).join('');

  header.innerHTML = `
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
      <a href="./index.html" class="text-strong flex items-center gap-2 text-base font-bold">
        <span class="text-xl">🌳</span>
        <span class="hidden md:inline">Fractal Tree Studio</span>
      </a>
      <div class="flex items-center gap-2">
        <nav class="flex items-center gap-1" aria-label="Journey">${navLinks}</nav>
        <button id="theme-toggle" class="icon-btn" type="button" aria-label="Toggle theme">
          ☀️
        </button>
        <div class="lang-switch" role="group" aria-label="Language">
          <button id="lang-en" class="lang-btn" type="button">EN</button>
          <button id="lang-es" class="lang-btn" type="button">ES</button>
        </div>
      </div>
    </div>`;

  refreshThemeButton();
  refreshLangButtons();
}

function renderChapterBadge(): void {
  const badge = document.getElementById('chapter-badge');
  if (!badge) return;
  const route = currentRoute();
  badge.textContent = t('chapter.badge', {
    n: chapterNumber(route),
    total: ROUTES.length,
    label: t(route.chapterKey),
  });
}

function renderPager(): void {
  const pager = document.getElementById('pager');
  if (!pager) return;

  const index = chapterNumber(currentRoute()) - 1;
  const prev = ROUTES[index - 1];
  const next = ROUTES[index + 1];

  const parts: string[] = [];
  if (prev) {
    parts.push(`<a href="./${prev.file}" class="btn-ghost">← <span>${t(prev.pagerKey)}</span></a>`);
  }
  if (next) {
    parts.push(
      `<a href="./${next.file}" class="btn-primary${prev ? '' : ' ml-auto'}"><span>${t(next.pagerKey)}</span> →</a>`
    );
  }
  pager.innerHTML = parts.join('');
}

function renderChrome(): void {
  renderHeader();
  renderChapterBadge();
  renderPager();
  // The links above are freshly created, so re-apply the ?lang= param.
  localizeInternalLinks();
}

/**
 * Initialize theme + language and render the shared chrome. Call once per
 * page, before rendering any translated dynamic content.
 *
 * Theme/lang button clicks are handled via delegation on the document so the
 * header can be re-rendered (e.g. on language switch) without re-binding.
 */
export function initChrome(): void {
  initTheme();
  initI18n();
  translatePage();
  renderChrome();

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest('#theme-toggle')) {
      toggleTheme();
      refreshThemeButton();
      return;
    }
    for (const lang of ['en', 'es'] as Lang[]) {
      if (target.closest(`#lang-${lang}`)) {
        setLang(lang);
        return;
      }
    }
  });

  window.addEventListener('ftree:langchange', () => {
    renderChrome();
  });
}
