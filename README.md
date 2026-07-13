# Fractal Tree Studio

A guided, bilingual (EN/ES) journey from _why is nature beautiful?_ to
_writing your own fractal formulas_ and _walking around a 3D tree_ — six
interactive chapters in the browser (HTML Canvas + WebGL), plus a Node CLI
that renders the same trees headlessly (PNG + SQLite history). One
TypeScript core, ports-and-adapters, zero backend: the whole site builds to
static files.

## Quick start

```bash
npm install
npm run dev       # http://localhost:3000
```

The CLI additionally needs Cairo/Pango system libraries for `node-canvas`
(Debian/Ubuntu: `sudo apt-get install libcairo2-dev libpango1.0-dev
libjpeg-dev libgif-dev librsvg2-dev`). The web app has no such requirement.

```bash
npm run cli -- generate --depth 7:10 --angle 15:40 --randomness 0.8
npm run cli -- history -n 5
```

## Documentation

The **enterprise architecture documents are the documentation home**,
numbered in the order the layers are assessed:

| Where                                        | What                                                                                                         |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [docs/ea/](./docs/ea/README.md)              | The system, layer by layer: `1_strategy` · `2_business` · `3_information` · `4_application` · `5_technology` |
| [docs/scope/](./docs/scope/README.md)        | One document per delivered initiative, and the EA-first change process                                       |
| [CONTRIBUTING.md](./CONTRIBUTING.md)         | Development workflow and definition of done                                                                  |
| [CLAUDE.md](./CLAUDE.md) + `.claude/skills/` | Guidance for AI agents working in this repo                                                                  |

New here? Read top-down:
[strategy](./docs/ea/1_strategy/README.md) →
[business](./docs/ea/2_business/README.md) →
[information](./docs/ea/3_information/README.md) →
[application](./docs/ea/4_application/README.md) →
[technology](./docs/ea/5_technology/README.md).
Changing something? Start with the process in
[docs/scope/](./docs/scope/README.md).

## Project structure

```
pages/            # The six HTML chapters (Vite root)
src/
├── core/         # Framework-agnostic domain + services (the only home of business logic)
├── adapters/     # web/ (Canvas2D, DOM) and node/ (node-canvas, SQLite)
├── composition/  # The only places concrete adapters are wired together
└── cli.ts        # Node CLI entry point
tests/core/       # Vitest unit tests
docs/             # ea/ (architecture, numbered layers) + scope/ (initiatives)
```

Details, diagrams, and the reasoning behind this shape:
[solution design](./docs/ea/4_application/4_solution-design.md).

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

## Deployment

The web app is a fully static bundle (`dist/web`). GitHub Pages deployment
ships in `.github/workflows/deploy.yml` (build + publish on every push to
`main`; one-time setup: Settings → Pages → Source = GitHub Actions). Any
other static host works: build `npm run build`, output `dist/web`.

## License

MIT. See the `license` field in `package.json`.
