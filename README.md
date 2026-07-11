# Fractal Tree Generator

An interactive fractal tree generator that runs in the browser (HTML
Canvas) and as a Node CLI (headless PNG rendering + SQLite history), built
on a shared TypeScript core. See [ARCHITECTURE.md](./ARCHITECTURE.md) for
the design patterns and project structure in detail.

## Features

- Interactive controls: recursion depth, branch angle, length factor,
  trunk length, line-width tapering, jitter/randomness, animation speed,
  and trunk/leaf colors.
- Same drawing algorithm on the web and in the CLI — both go through the
  same `FractalService`, so results are consistent between the two.
- CLI mode renders to PNG and logs each generation's parameters to SQLite
  - JSON, for headless batch generation or scripting.

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
npm run cli -- generate --depth 9 --angle 25 --randomness 0.3 --show-accent
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
