// Single source of truth for the site's guided journey. The header nav,
// chapter badges, pagers and language-aware internal links are all rendered
// from this list, so adding a page is one new entry here (plus its HTML file
// and Vite input).
//
// This module must stay a leaf (no i18n/chrome imports): it stores dictionary
// keys, never translated strings, so i18n.ts can import it without a cycle.

export interface Route {
  id: 'why' | 'learn' | 'tree' | 'snowflake' | 'create' | 'tree3d';
  file: string;
  /** Short nav chip label, e.g. "Why?" */
  navKey: string;
  /** Long pager label naming the page, e.g. "Grow your own tree" */
  pagerKey: string;
  /** Chapter subtitle, e.g. "The wonder" */
  chapterKey: string;
}

export const ROUTES: Route[] = [
  {
    id: 'why',
    file: 'index.html',
    navKey: 'nav.why',
    pagerKey: 'pager.why',
    chapterKey: 'chapter.why',
  },
  {
    id: 'learn',
    file: 'learn.html',
    navKey: 'nav.learn',
    pagerKey: 'pager.how',
    chapterKey: 'chapter.learn',
  },
  {
    id: 'tree',
    file: 'generator.html',
    navKey: 'nav.generator',
    pagerKey: 'pager.tree',
    chapterKey: 'chapter.tree',
  },
  {
    id: 'snowflake',
    file: 'snowflake.html',
    navKey: 'nav.snowflake',
    pagerKey: 'pager.snowflake',
    chapterKey: 'chapter.snowflake',
  },
  {
    id: 'create',
    file: 'create.html',
    navKey: 'nav.create',
    pagerKey: 'pager.create',
    chapterKey: 'chapter.create',
  },
  {
    id: 'tree3d',
    file: 'tree3d.html',
    navKey: 'nav.tree3d',
    pagerKey: 'pager.tree3d',
    chapterKey: 'chapter.tree3d',
  },
];

/** Resolve the route for the current page; the site root serves index.html. */
export function currentRoute(): Route {
  const basename = window.location.pathname.split('/').pop() || 'index.html';
  return ROUTES.find((route) => route.file === basename) ?? ROUTES[0];
}

/** 1-based chapter number of a route. */
export function chapterNumber(route: Route): number {
  return ROUTES.findIndex((r) => r.id === route.id) + 1;
}
