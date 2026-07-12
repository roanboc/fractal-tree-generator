# Project Scope — Consistent Navigation & Rule-Builder Editing

_[← Scope index](./README.md) · [EA home](../ea/README.md)_

**ArchiMate viewpoint:** Implementation & Migration.
**Delivered as:** branch `claude/project-structure-docs-mgef0d` (second
initiative on the branch, after [#4](./4_project-structure-and-ea-docs.md)).

Two visitor-facing fixes plus one process artifact: chapter navigation had
drifted (duplicated in chapters 1–2, stale finale in chapter 3, absent in
chapters 4–5), the visual rule builder appended new steps after the
trailing self-call — breaking the rule the visitor was building — and
offered no way to reorder steps. PR descriptions also lacked a template
ensuring they cover the whole branch.

## EA alignment (assessed top-down before implementing)

| Layer         | Impact                                                                                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1_strategy    | No change. Reinforces Principle 3 ("basic → advanced" journey) and Principle 1 (the rule stays teachable — self-call reads last).                                       |
| 2_business    | P1 (guided journey): pager/header confirmed as the **only** chapter navigation. P2 (create-a-fractal): visual editing keeps the self-call last and supports reordering. |
| 3_information | No change — no new data objects or flows.                                                                                                                               |
| 4_application | `insertStep` added to the formula toolchain (core); rule-builder rows gain move up/down; chrome resolves `data-nav` links from the route list; CTA anchors removed.     |
| 5_technology  | No change. `.github/pull_request_template.md` added (GitHub renders it automatically).                                                                                  |

## Plateaus

| Plateau                | State                                                                                                                                                                                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Baseline** (before)  | CTA buttons duplicating the pager on chapters 1–2; chapter 3 ending with a stale "start again" finale; chapters 4–5 without closure; builder appends after the self-call; no reordering; no PR template.                                                       |
| **Target** (delivered) | One navigation system (header + pager) on all five chapters; narrative cards tell the story without duplicating links; chapter 5 carries the journey's closure; builder inserts before the trailing self-call and steps can be reordered; PR template + skill. |

## Work packages and deliverables

### WP1 — One navigation system across the journey

- **Deliverables:** duplicated CTA anchors removed from `pages/index.html`
  and `pages/learn.html`; stale restart link removed from
  `pages/generator.html`; journey-closure card (with restart link) added to
  `pages/create.html`; `chrome.ts` resolves `a[data-nav="next|prev|restart"]`
  hrefs from `routes.ts` so in-page links can never drift from the route
  list; unused CTA-button strings removed from the i18n dictionary.
- **Outcome:** every chapter navigates the same way — numbered header +
  prev/next pager — and the journey's finale lives on its actual last page.

### WP2 — Rule-builder editing that matches the mental model

- **Deliverables:** `insertStep` in `src/core/application/turtle/formula.ts`
  (inserts new steps before the trailing self-call run; a new self-call
  still appends last) with unit tests in `tests/core/TurtleFormula.test.ts`;
  move up/down buttons on every rule row and branch group in
  `RuleBuilderView.ts`; EN/ES strings for the new controls.
- **Outcome:** "do the steps, then repeat" stays true while editing —
  adding a step no longer breaks the fractal — and steps can be reordered
  without delete-and-re-add.

### WP3 — PR description covering the whole branch

- **Deliverables:** `.github/pull_request_template.md` (summary, scope-doc
  link, EA-layer table, full-branch changes, verification);
  `.claude/skills/pr-description/SKILL.md` instructing agents to describe
  `main..HEAD` — never just the latest commit — and to keep the PR body
  updated as the branch grows; CONTRIBUTING/skill cross-references.
- **Outcome:** PR bodies document initiatives, not commits.

## In scope / out of scope

| In scope                                               | Out of scope (gaps, candidate future work)                   |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| Route-driven `data-nav` resolution for in-page links   | Drag-and-drop reordering in the rule builder                 |
| Insert-before-trailing-self-call as a tested core rule | Enforcing "self-call last" in the _text_ formula (valid DSL) |
| Move up/down for rows and branch groups                | Keyboard shortcuts for reordering                            |
| PR template + `pr-description` skill                   | CI check that the PR body follows the template               |

## Gap notes

- **Text formulas may still place steps after a self-call** — that is valid
  DSL (they run after the recursion unwinds) and intentionally allowed for
  advanced authors; only the _visual_ builder guards the common case.
- **Drag-and-drop** would supersede the up/down buttons; the buttons keep
  the DOM simple and accessible until the builder warrants a library.
