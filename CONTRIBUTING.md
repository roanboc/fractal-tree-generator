# Contributing

## The working method: EA first

This repo practices **architecture-first development**: strategy and
business architecture are validated before information, application, and
technology — and all of it before code. The full process is described in
[docs/scope/README.md](./docs/scope/README.md); in short, for any change in
requirements:

1. **Align the EA** — walk [docs/ea/](./docs/ea/README.md) top-down
   (`1_strategy` → `5_technology`), updating the affected documents.
2. **Document the scope** — add the next-numbered initiative document to
   [docs/scope/](./docs/scope/README.md).
3. **Implement** — keeping docs and code in sync in the same change set.

Bug fixes that change no documented behavior can go straight to step 3.
Agent-oriented guidance for the same process lives in `.claude/skills/`.

Pull requests follow `.github/pull_request_template.md`: the body links the
scope document, gives every EA layer a verdict, and describes **all**
changes on the branch (`git diff main...HEAD`), not just the latest commit —
and is kept updated as the branch grows.

## Development workflow

```bash
npm install        # once; the CLI additionally needs Cairo/Pango, see README
npm run dev        # Vite dev server at http://localhost:3000
```

Before pushing (CI runs exactly these):

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

- **TypeScript strict mode** everywhere.
- **Pre-commit hooks** (husky + lint-staged) run ESLint and Prettier on
  staged files.
- **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`).
- Keep `core/` platform-free: it may only depend on `src/core/ports.ts`
  interfaces. Concrete adapters are wired exclusively in `src/composition/`.
- Every user-facing string ships in English **and** Spanish via
  `src/adapters/web/i18n.ts`.

## Definition of done

A change is done when:

- lint, typecheck, tests, and the production build pass;
- the affected EA documents ([docs/ea/](./docs/ea/README.md)) still
  describe the system as it now is — components, data objects, contracts,
  and business rules all name real code artifacts;
- the initiative's scope document reflects what was actually delivered;
- new behavior is covered by unit tests in `tests/core/` when it lives in
  the core.
