# Project Scope — Chapter Bridges, Fern Default & Control Affordance

_[← Scope index](./README.md) · [EA home](../ea/README.md)_

**ArchiMate viewpoint:** Implementation & Migration.
**Delivered as:** branch `claude/navigation-button-usability-3f6dxv`.

Three visitor-facing polish items surfaced by usage feedback: the journey
breaks narratively between chapters 3→4 and 4→5 (the closing cards end
their own chapter without setting up the next), chapter 5 opens with the
same tree the visitor just grew in chapter 3, and several interactive
controls — especially in dark mode and on phones — do not read as
clickable (ghost/outline buttons with a 10%-alpha border, sub-40px touch
targets).

## EA alignment (assessed top-down before implementing)

| Layer         | Impact                                                                                                                                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1_strategy    | No change. Reinforces Principle 3 ("basic → advanced" journey — each chapter now hands off to the next) and Principle 5 (all new copy ships EN + ES).                                                                   |
| 2_business    | P1 (guided journey) unchanged in rule and strengthened in practice: bridges are **copy only**, so the pager/header remain the only chapter navigation. P2 diagram updated: chapter 5's starting preset is now the fern. |
| 3_information | Preset catalog row updated: `DEFAULT_PRESET_ID` names the preset loaded on page start. No new data objects or flows.                                                                                                    |
| 4_application | No structural change — bridge copy uses the existing `data-i18n-html` mechanism; the default preset is a data change inside `create.ts`; affordance work is presentation-only (`src/assets/styles.css`).                |
| 5_technology  | No change.                                                                                                                                                                                                              |

## Plateaus

| Plateau                | State                                                                                                                                                                                                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Baseline** (before)  | Chapter 3 ends answering its own question with no hint of chapter 4; chapter 4's outro teases "you write the rule" without naming what else the rule can draw; chapter 5 defaults to the tree; Reset/Clear/Download/theme-toggle nearly invisible in dark mode; touch targets down to 18 px. |
| **Target** (delivered) | Each closing card narratively sets up the next chapter (pager stays the only link); chapter 5 opens on the fern; interactive controls carry a visible fill and a stronger border via `--border-strong`; coarse-pointer devices get ≥40 px hit areas.                                         |

## Work packages and deliverables

### WP1 — Narrative bridges between chapters 3→4 and 4→5

- **Deliverables:** bridge paragraph (`conclusion.bridge`, EN + ES) appended
  to the conclusion card in `pages/generator.html`; rewritten
  `snowflake.outro.body` (EN + ES) in `pages/snowflake.html` naming the
  custom shapes ahead (ferns, bushes, crystals, spirals); both in
  `src/adapters/web/i18n.ts`.
- **Outcome:** the journey reads as one continuous story — every closing
  card sets up the next chapter, per P1, without duplicating the pager's
  link.

### WP2 — Fern as chapter 5's starting preset

- **Deliverables:** `DEFAULT_PRESET_ID = 'fern'` in
  `src/adapters/web/create.ts`; catalog order (and therefore the preset
  `<select>` order) unchanged.
- **Outcome:** chapter 5 opens with a shape the visitor has not already
  grown, making "you write the rule" feel like new ground rather than a
  repeat of chapter 3.

### WP3 — Control affordance and touch targets

- **Deliverables:** in `src/assets/styles.css`: `--border-strong` theme
  variable (interactive elements only; cards keep `--border`); `.btn-ghost`
  gains a `--chip-bg` fill and the stronger border; `.btn-outline-warm`
  gains a stronger dark-mode border and a faint rest fill; `.icon-btn` and
  `.lang-switch` borders upgraded; one `@media (pointer: coarse)` block
  giving `.info-btn`, `.rule-delete`, `.rule-move` ≥40 px hit areas
  (`::after` overlays, visual size unchanged) and `.nav-link`/`.icon-btn`
  ≥40 px sizing.
- **Outcome:** buttons read as buttons in both themes, and every
  interactive control is comfortably tappable on a phone.

## In scope / out of scope

| In scope                                             | Out of scope (gaps, candidate future work)                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------ |
| Bridge copy on chapters 3 and 4 closing cards        | Equivalent bridge treatment for chapters 1–2 closing cards               |
| Fern as the chapter 5 default preset                 | Reordering the preset catalog itself                                     |
| Dark-mode affordance for ghost/outline/icon controls | `:focus-visible` rings on `.icon-btn`/`.info-btn` (only `.btn` has them) |
| Coarse-pointer hit-area enlargement                  | 3D fractal rendering (WebGL adapter — separate initiative)               |
|                                                      | Shareable formula permalinks                                             |

## Gap notes

- **Chapters 1–2 closing cards** still end without an explicit narrative
  hand-off; applying the same copy treatment is cheap and would make the
  pattern journey-wide.
- **Focus-visible rings** are missing on icon-sized controls; adding them
  is a few lines in `styles.css` and would round out keyboard
  accessibility.
- **Decorative emoji and `.formula-code` chips** were assessed for false
  affordance: they carry no hover styles or `cursor: pointer`, so no code
  change was needed — the confusion reported on phones is addressed by
  making _real_ buttons look clearly interactive instead.
- **3D fractals** are feasible under the current architecture (a new
  renderer adapter behind the existing ports; the turtle model extends to
  pitch/roll/yaw) but are an initiative of their own, not a polish item.
