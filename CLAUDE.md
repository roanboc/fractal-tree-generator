# CLAUDE.md

Interactive fractal studio: a five-chapter web journey (browser Canvas2D)
plus a Node CLI (headless PNG + SQLite history), sharing one TypeScript
core via ports-and-adapters.

## The rule that governs everything else

**Strategy and business architecture are validated before any other
layer.** A change in requirements is never coded directly: align it through
the numbered EA layers (`docs/ea/1_strategy` → … → `5_technology`), record
it in a scope document (`docs/scope/`), then implement. Use the
`ea-first-change` skill for the process, `scope-doc` for the scope
document, `ea-doc-style` when touching anything under `docs/`, and
`pr-description` when opening or updating a PR (the body must cover the
whole branch, not just the latest commit).
Pure bug fixes that change no documented behavior can skip the alignment,
but still keep the docs true.

## Layout

- `pages/` — the five HTML entry points (Vite root). URLs don't change when
  built: `index.html`, `learn.html`, `generator.html`, `snowflake.html`,
  `create.html`.
- `src/core/` — framework-agnostic domain + services. Depends only on
  `src/core/ports.ts` interfaces, never on adapters.
- `src/adapters/web/`, `src/adapters/node/` — platform implementations of
  the ports.
- `src/composition/` — the only files that instantiate concrete adapters.
- `tests/core/` — Vitest unit tests for core services.
- `docs/ea/` — the documentation home (numbered ArchiMate layers);
  `docs/scope/` — one doc per initiative.

## Commands

- `npm run dev` — Vite dev server (port 3000)
- `npm run build` — static web bundle to `dist/web`
- `npm test` / `npm run typecheck` / `npm run lint` / `npm run format:check`
- `npm run cli -- generate [options]` — CLI render (needs Cairo/Pango
  system libs for node-canvas)

Run lint, typecheck, tests, and build before pushing; CI runs the same.

## Conventions

- TypeScript strict mode; Conventional Commits (`feat:`, `fix:`, …).
- Every user-facing string goes through the i18n dictionary
  (`src/adapters/web/i18n.ts`), EN + ES.
- Business rules (parameter constraints) live in `ConfigService` and get a
  rationale row in `docs/ea/2_business/5_domain-context-and-rules.md`
  before they get code.
- Use the domain glossary terms from that same document in code and
  commits.
- New ports/adapters: follow "Adding a new port" in
  `docs/ea/4_application/5_interface-contracts.md` and "Adding a new
  platform" in `docs/ea/4_application/4_solution-design.md`.
