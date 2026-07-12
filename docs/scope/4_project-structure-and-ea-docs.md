# Project Scope — Project Structure & EA-First Documentation

_[← Scope index](./README.md) · [EA home](../ea/README.md)_

**ArchiMate viewpoint:** Implementation & Migration.
**Delivered as:** branch `claude/project-structure-docs-mgef0d`.

This initiative reorganizes the repository around the EA-first working
method it also introduces: the enterprise architecture documents become the
single home of project documentation, numbered in assessment order, and
every future requirement change is aligned through them (and captured here,
in a scope document) before implementation.

## EA alignment (assessed top-down before implementing)

| Layer         | Impact                                                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1_strategy    | No change to goals or value stream; supports the existing "easy to extend, easy to contribute" stakeholder interest.                |
| 2_business    | No change to business services. Domain context, glossary and rules moved into the layer (`5_domain-context-and-rules.md`).          |
| 3_information | No change to data objects or flows. Data architecture moved into the layer (`3_data-architecture.md`).                              |
| 4_application | No behavior change. HTML entry points moved to `pages/` (built URLs unchanged); solution design and contracts moved into the layer. |
| 5_technology  | Vite `root` now `pages/`; build output, CI, and GitHub Pages deployment unchanged.                                                  |

## Plateaus

| Plateau                | State                                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Baseline** (before)  | Five HTML pages and `ARCHITECTURE.md` in the root; four standalone docs overlapping the unnumbered `docs/ea/` set; no agent guidance.             |
| **Target** (delivered) | Root holds only configs + `README.md`/`CLAUDE.md`/`CONTRIBUTING.md`; numbered EA layers are the single documentation home; scope folder + skills. |

## Work packages and deliverables

### WP1 — Root cleanup

- **Deliverables:** `pages/` directory for the five HTML entry points;
  `vite.config.ts` `root: 'pages'` (identical built URLs, verified by
  production build); Tailwind content globs updated.

### WP2 — Numbered EA documentation as the single source

- **Deliverables:** layer folders renamed `1_strategy` … `5_technology`;
  files numbered per layer in analysis order, with the order explained in
  each layer README; `ARCHITECTURE.md` → `4_application/4_solution-design.md`;
  `docs/CONTRACTS.md` → `4_application/5_interface-contracts.md`;
  `docs/BUSINESS_CONTEXT.md` → `2_business/5_domain-context-and-rules.md`
  (duplicated actor table removed in favor of the strategy/business docs);
  `docs/DATA_ARCHITECTURE.md` → `3_information/3_data-architecture.md`;
  all cross-links rewritten.

### WP3 — Scope document series

- **Deliverables:** `docs/scope/` with a README describing the EA-first
  change process, retrospective records for initiatives #1–#2, the
  relocated #3, and this document.

### WP4 — Agent guidance

- **Deliverables:** `.claude/skills/ea-first-change/` (the change process),
  `.claude/skills/scope-doc/` (scope document template),
  `.claude/skills/ea-doc-style/` (numbering + ArchiMate/Mermaid
  conventions); `CLAUDE.md` project guide.

### WP5 — Entry-point documentation

- **Deliverables:** rewritten `README.md` (concise: what/run/docs pointers);
  `CONTRIBUTING.md` holding the development workflow and definition of done.

## In scope / out of scope

| In scope                                              | Out of scope (gaps, candidate future work) |
| ----------------------------------------------------- | ------------------------------------------ |
| Moving files with history preserved (`git mv`)        | Architecture Decision Records (ADR) series |
| Numbered EA folders/files + analysis order in READMEs | Automated link checking for docs in CI     |
| Skills encoding the EA-first process                  | Issue/PR templates referencing the process |
| Root README/CONTRIBUTING split                        | CHANGELOG / release versioning             |

## Gap notes

- **Docs drift risk:** nothing mechanically verifies that EA docs match the
  code; the `verify docs` step in CONTRIBUTING and the skills mitigate but
  don't eliminate it. A CI link checker (e.g. `lychee`) is the cheapest
  next step.
- **Numbering churn:** inserting a document mid-sequence renumbers
  followers; acceptable at this scale, revisit if a layer exceeds ~9 files.
