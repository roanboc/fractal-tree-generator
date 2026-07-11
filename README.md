# Fractal Tree Generator

An interactive fractal tree generator that runs in the browser (HTML
Canvas) and as a Node CLI (headless PNG rendering + SQLite history), built
on a shared TypeScript core.

## Documentation

| Document                                                 | Covers                                                                                 |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md)                     | Solution design, project structure, component/class/sequence diagrams, patterns in use |
| [docs/CONTRACTS.md](./docs/CONTRACTS.md)                 | Interface contracts — pre/postconditions, invariants, error behavior for every port    |
| [docs/BUSINESS_CONTEXT.md](./docs/BUSINESS_CONTEXT.md)   | Problem statement, actors, domain glossary, business rules and their rationale         |
| [docs/DATA_ARCHITECTURE.md](./docs/DATA_ARCHITECTURE.md) | Data entities, ER diagram, data flow, classification, storage, retention               |

## Features

- Polished interactive generator: iterations, branch angle, and shrink
  factor are **ranges** (dual-thumb sliders) sampled per branch for
  natural-looking trees; wildness controls how much of each range is
  used. Plus trunk length/thickness, growth animation, trunk/leaf color
  pickers, per-control explanations, reset-to-defaults, and one-click PNG
  download.
- Light/dark theme (follows the device by default, toggleable) and an
  English/Spanish language switcher that keeps the choice in the URL
  (`?lang=es`) so shared links open in the sender's language.
- A kid-friendly **"How fractals work"** page (`learn.html`) that teaches
  fractals by iteration: step-by-step mini canvases (1 → 31 sticks), the
  recursive rule written as a simple formula, a hand-drawn-style
  interactive playground, and a tidy-vs-wild randomness comparison — all
  rendered by the same core `FractalService` as the main generator.
- Same drawing algorithm on the web and in the CLI — both go through the
  same `FractalService`, so results are consistent between the two.
- CLI mode renders to PNG and logs each generation's parameters to both
  SQLite and JSON, for headless batch generation or scripting.

## Getting started

```bash
npm install
npm run dev       # start the Vite dev server at http://localhost:3000
```

Open the printed URL, adjust the sliders, and click **Generate**.

## Scripts

| Command                                   | Description                                   |
| ----------------------------------------- | --------------------------------------------- |
| `npm run dev`                             | Start the Vite dev server                     |
| `npm run build`                           | Production build of the web app to `dist/web` |
| `npm run serve`                           | Preview the production build locally          |
| `npm run cli -- generate [options]`       | Generate a fractal PNG from the command line  |
| `npm run cli -- history`                  | Show recent CLI generations                   |
| `npm run typecheck`                       | Type-check the whole codebase                 |
| `npm run lint` / `npm run lint:fix`       | Lint (and fix) with ESLint                    |
| `npm run format` / `npm run format:check` | Format (and check) with Prettier              |
| `npm test`                                | Run the Vitest unit test suite                |

### CLI example

```bash
# fixed values…
npm run cli -- generate --depth 9 --angle 25 --randomness 0.3 --show-accent
# …or min:max ranges sampled per branch, scaled by --randomness (wildness)
npm run cli -- generate --depth 7:10 --angle 15:40 --length-factor 0.6:0.8 --randomness 0.8
npm run cli -- history -n 5
```

The CLI depends on `node-canvas`, which needs Cairo/Pango system
libraries. On Debian/Ubuntu:

```bash
sudo apt-get install libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

The web app has no such requirement — it only uses the browser's built-in
Canvas2D API.

## Project structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full breakdown. In short:

```
src/
├── core/            # Framework-agnostic domain types, ports, and business logic
├── adapters/         # web/ (browser Canvas2D) and node/ (node-canvas + SQLite)
├── composition/      # WebComposition.ts and NodeComposition.ts — the only
│                      # places concrete adapters are wired together
└── cli.ts            # Node CLI entry point
tests/core/            # Vitest unit tests for the core application services
docs/                  # CONTRACTS.md, BUSINESS_CONTEXT.md, DATA_ARCHITECTURE.md
```

## Deploying for free

The web app builds to a fully static bundle (`dist/web`), so it can be
hosted for free on any static host. This repo ships with:

- **GitHub Pages** (`.github/workflows/deploy.yml`) — builds and deploys
  automatically on every push to `main`. One-time setup: in the repo's
  **Settings → Pages**, set "Source" to **GitHub Actions**. No extra
  account or secrets needed.

Other free static hosts (Cloudflare Pages, Vercel, Netlify) also work with
zero config beyond pointing them at this repo — build command
`npm run build`, output directory `dist/web`.

## Development practices

- **TypeScript strict mode** everywhere.
- **Ports & Adapters architecture** — see [ARCHITECTURE.md](./ARCHITECTURE.md).
- **Pre-commit hooks** (husky + lint-staged) run ESLint and Prettier on
  staged files before every commit.
- **CI** (`.github/workflows/ci.yml`) runs lint, typecheck, tests, and a
  production build on every push and pull request.
- **Conventional Commits** style (`feat:`, `fix:`, `refactor:`, `chore:`)
  is used for commit messages.

## License

MIT. See the `license` field in `package.json`.
