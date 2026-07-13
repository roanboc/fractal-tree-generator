# Project Scope — The 3D Tree Chapter & Journey-Wide Bridges

_[← Scope index](./README.md) · [EA home](../ea/README.md)_

**ArchiMate viewpoint:** Implementation & Migration.
**Delivered as:** branch `claude/3d-renderer-page-integration-z4yrky`.

The follow-ups of [initiative 6](./6_chapter-bridges-and-affordance.md),
headlined by the one it explicitly deferred as "an initiative of its own":
3D fractal rendering, integrated into the journey as a sixth chapter. The
same branching rule the visitor learned in chapter 2 and grew in chapter 3
is grown in space — each split tilts **and** twists around its parent — on
a new WebGL renderer adapter behind new ports. Alongside it, the two cheap
gaps from initiative 6 close: chapters 1–2 get the same narrative
hand-off treatment as chapters 3–5, and icon-sized controls get
`:focus-visible` rings.

## EA alignment (assessed top-down before implementing)

| Layer         | Impact                                                                                                                                                                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1_strategy    | Value stream gains a sixth stage, **Behold** (the rule seen leaving the page); new outcome under the "wonder" goal; new course of action: hand-written WebGL, no 3D library (zero-cost driver). Principles 1–5 all reinforced, none touched.                                                                       |
| 2_business    | New business service **3D tree beholding** (Creator role, chapter 6); P1 gains a sixth process step and the journey's closing "start again" moment moves to `tree3d.html`; glossary gains **Twist**; new business-rule table for the 3D engine's constraints (including the 15 000-segment safety budget).         |
| 3_information | New platform-free data objects in `src/core/domain/tree3d.ts`: `Tree3DParams`, `Segment3D`/`Vec3` (the built scene), `Tree3DRenderResult`. Nothing new is persisted — the scene is as transient as the 2D canvas raster.                                                                                           |
| 4_application | New core engine `Tree3DService` behind two new ports (`ITree3DService`, `ITree3DRendererService`, contracted in the interface-contracts doc); new adapter `WebGLTreeRendererService`; new page component `tree3d.ts` + `Tree3DControls`; new composition root `composeTree3DServices`; sixth entry in `routes.ts`. |
| 5_technology  | Browser WebGL API joins Canvas2D as a runtime technology service; a sixth static page in the Vite build. No new dependencies, no build/CI/hosting change.                                                                                                                                                          |

## Plateaus

| Plateau                | State                                                                                                                                                                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Baseline** (before)  | Five chapters, all flat Canvas2D; the journey closes on chapter 5's "last chapter" card; chapters 1–2 closing cards end without a narrative hand-off; icon-sized controls have no keyboard focus indicator; 3D rendering exists only as a gap note in initiative 6.                         |
| **Target** (delivered) | Six chapters: chapter 6 grows the tree in 3D (orbit by drag, zoom, slow spin, staggered growth, PNG export) on a raw-WebGL adapter; every closing card 1→5 hands off to the next chapter and the restart moment lives on chapter 6; `.icon-btn`-class controls show `:focus-visible` rings. |

## Work packages and deliverables

### WP1 — 3D tree engine (core)

- **Deliverables:** `src/core/domain/tree3d.ts` (types + `TREE3D_MAX_SEGMENTS`);
  `src/core/application/Tree3DService.ts` (`TREE3D_DEFAULTS`,
  `validateTree3DParams`, breadth-first builder); `ITree3DService` and
  `ITree3DRendererService` in `src/core/ports.ts`; contracts in
  [interface contracts](../ea/4_application/5_interface-contracts.md);
  unit tests in `tests/core/Tree3DService.test.ts`.
- **Outcome:** the 3D branching rule exists exactly once, platform-free,
  with the same safety-budget guarantee as the turtle engine.

### WP2 — WebGL renderer adapter

- **Deliverables:** `src/adapters/web/WebGLTreeRendererService.ts` — raw
  WebGL (no library): one shader pair drawing each segment as a
  screen-facing ribbon with perspective width, depth fog toward the theme
  background, level-staggered growth reveal (instant under
  `prefers-reduced-motion`), pointer-drag orbit + wheel/pinch zoom,
  optional slow spin, PNG download; graceful no-op degradation when WebGL
  is unavailable.
- **Outcome:** a second web rendering strategy behind a port, per the
  "Adding a new platform" recipe — the core never learns what a camera is.

### WP3 — Chapter 6 page, integrated into the journey

- **Deliverables:** `pages/tree3d.html`; entry `src/adapters/web/tree3d.ts`;
  panel `src/adapters/web/Tree3DControls.ts`; `composeTree3DServices` in
  `src/composition/WebComposition.ts`; sixth route in `routes.ts`; Vite
  input; EN + ES copy for hero, controls, help boxes and outro in
  `i18n.ts`; the journey's closing card (restart link) moves here from
  chapter 5.
- **Outcome:** the header, badges and pagers all show six chapters from the
  single route list; the journey ends on the 3D finale.

### WP4 — Journey-wide narrative bridges

- **Deliverables:** bridge paragraphs (EN + ES) on the chapter 1 and 2
  closing cards (`story.cta.bridge`, `learn.cta.bridge`); chapter 5's outro
  rewritten to bridge into chapter 6 (`create.outro.*`); chapter 4's
  "final chapter" wording corrected to "next chapter"
  (`snowflake.outro.body`).
- **Outcome:** every closing card 1→5 now sets up the next chapter — the
  pattern initiative 6 started is journey-wide, still copy-only (the pager
  remains the sole navigation).

### WP5 — Focus-visible rings on icon-sized controls

- **Deliverables:** `src/assets/styles.css`: the `.btn` focus ring applied
  to `.icon-btn`, `.info-btn`, `.lang-btn`, `.rule-delete`, `.rule-move`
  and `.nav-link`.
- **Outcome:** keyboard users can see where focus is on every interactive
  control, not just full-size buttons.

## In scope / out of scope

| In scope                                             | Out of scope (gaps, candidate future work)                     |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| 3D **tree** (the chapter-3 rule, one more dimension) | 3D for turtle programs/formulas (pitch/roll/yaw DSL extension) |
| Raw-WebGL renderer behind a new port                 | CLI/headless rendering of the 3D scene                         |
| Bridges on chapters 1, 2 and 5 closing cards         | Reordering the preset catalog (carried over from initiative 6) |
| Focus-visible rings on icon-sized controls           | Shareable formula permalinks (carried over from initiative 6)  |
| Slow-spin toggle honoring `prefers-reduced-motion`   |                                                                |

## Gap notes

- **3D turtle programs** would make chapter 5's formulas orbitable too. The
  DSL would need pitch/roll turns and `TurtleFractalService` a 3D pose —
  a real language change, deliberately not smuggled in behind the tree.
- **Headless 3D** has no renderer: `ITree3DRendererService` currently has
  only the WebGL implementer. A Node adapter (e.g. software projection to
  `node-canvas`) is composition-only work thanks to the port, but nobody
  has asked for it.
- **Preset reordering** and **formula permalinks** remain exactly as
  initiative 6 left them: the first has no agreed target order, the second
  is its own small initiative (URL-encoded program + options).
