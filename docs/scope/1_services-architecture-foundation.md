# Project Scope — Services Architecture Foundation

_[← Scope index](./README.md) · [EA home](../ea/README.md)_

**ArchiMate viewpoint:** Implementation & Migration.
**Delivered as:** PRs #1–#3 (branches `claude/improve-fractal-generator-*`,
`claude/tree-fractal-web-generator-*`).

> **Retrospective record.** This initiative predates the EA-first process;
> the summary below is reconstructed from the git history so the scope
> series is complete from the beginning.

## Plateaus

| Plateau                | State                                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Baseline** (before)  | A single-script fractal tree generator.                                                                          |
| **Target** (delivered) | A TypeScript, services-driven codebase: shared core, web + CLI adapters, SQLite/JSON logging, documented design. |

## Work packages (reconstructed)

- **WP1 — TypeScript services migration** (PR #1): services-driven
  architecture, Node CLI with headless rendering and structured logging.
- **WP2 — Ports-and-adapters refactor** (PR #2): hexagonal `core/` /
  `adapters/` / `composition/` split fixing web/CLI drift; modern tooling
  (Vite, ESLint flat config, Prettier, husky, CI); solution design,
  interface contracts, and business/data architecture documented.
- **WP3 — UI redesign** (PR #3): friendlier UI and a kid-friendly "How
  fractals work" page.

## Gap notes

- Documentation lived in four root-level files; consolidated into the
  layered EA set by initiative
  [#4](./4_project-structure-and-ea-docs.md).
