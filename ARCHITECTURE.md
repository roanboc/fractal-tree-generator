# Architecture

This project follows a **Ports & Adapters (Hexagonal) Architecture**. The
goal: the fractal-drawing algorithm and its business rules exist in exactly
one place, and every platform-specific concern (browser Canvas, Node's
`node-canvas`, SQLite, the CLI) plugs into that core through interfaces —
never the other way around.

```
src/
├── core/                        # Framework-agnostic domain + business logic
│   ├── domain/types.ts          # Value types: FractalParams, CanvasConfig, ...
│   ├── ports.ts                 # Interfaces the core depends on (never concretes)
│   └── application/
│       ├── FractalService.ts    # The one true recursive drawing algorithm
│       ├── ConfigService.ts     # Defaults + validation/clamping
│       ├── SpeedControlService.ts
│       └── math.ts              # Pure numeric helpers
├── adapters/                    # Platform-specific implementations of the ports
│   ├── web/
│   │   ├── WebRendererService.ts   # Implements IRendererService via Canvas2D
│   │   ├── ControlsView.ts         # DOM-only: reads/writes form elements
│   │   └── main.ts                 # Browser entry point
│   └── node/
│       ├── NodeCanvasRendererService.ts  # Implements IRendererService via node-canvas
│       ├── FractalLogRepository.ts       # Implements IFractalLogRepository via SQLite
│       └── LoggerService.ts
├── composition/                 # Composition roots — the only place adapters are wired together
│   ├── WebComposition.ts        # Used by adapters/web/main.ts only
│   └── NodeComposition.ts       # Used by cli.ts only
└── cli.ts                       # Node CLI entry point
```

## Why two composition roots instead of one factory

An earlier version of this codebase had a single `ServiceFactory` that
branched on `mode: 'cli' | 'web'`, but statically imported **both**
`NodeCanvasRendererService` (which pulls in the native `node-canvas` addon)
and `WebRendererService` at the top of the same file. Because ES module
imports are resolved statically, that meant every web build's module graph
included the Node-only native dependency — bloating (or breaking) the
browser bundle even though it was never used at runtime.

Splitting into `WebComposition.ts` and `NodeComposition.ts` means each entry
point's module graph only ever contains the adapters it actually needs.
`adapters/web/main.ts` never has a static or dynamic path to `node-canvas`
or `better-sqlite3`. This is verified by the production build: the browser
bundle is ~5.5KB regardless of the CLI's dependencies.

## Patterns in use

- **Ports & Adapters (Hexagonal Architecture)** — `core/` depends only on
  the interfaces in `core/ports.ts`; `adapters/` provides the concrete
  implementations. Swapping the renderer (browser vs. headless PNG) requires
  no change to `FractalService`.
- **Dependency Injection (constructor injection)** — `FractalService` takes
  its renderer, speed control, and config service as constructor arguments.
  It's fully unit-testable with fakes/spies (see `tests/core/`).
- **Strategy Pattern** — `IRendererService` has two interchangeable
  strategies (`WebRendererService`, `NodeCanvasRendererService`) selected by
  which composition root is used.
- **Repository Pattern** — `FractalLogRepository` isolates SQLite access
  behind `IFractalLogRepository`. It's CLI-only and never referenced from
  the web composition root.
- **Composition Root** — `WebComposition.ts` / `NodeComposition.ts` are the
  only files that `new` up concrete adapter classes. Nothing else in the
  codebase should instantiate an adapter directly.
- **Single Responsibility** — `ControlsView.ts` only touches the DOM
  (reading slider values, building the control panel). It has no knowledge
  of the fractal-drawing algorithm; that logic lives once, in
  `FractalService`.

## Language choice

TypeScript (strict mode) for both the browser bundle and the Node CLI —
one language, one type system, across the whole stack, with first-class
typings for both the Canvas2D/DOM APIs and Node's `fs`/`path`. It compiles
to plain static assets for the web target, which is what free static hosts
(GitHub Pages, Cloudflare Pages, Vercel, Netlify) expect.

## Tooling

| Concern          | Tool                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Build            | Vite 6                                                                                                                    |
| Styling          | Tailwind CSS 3 (via PostCSS)                                                                                              |
| CLI framework    | commander                                                                                                                 |
| Node persistence | better-sqlite3 (CLI-only)                                                                                                 |
| Tests            | Vitest, unit-testing `core/application/*` in isolation                                                                    |
| Lint             | ESLint (`typescript-eslint` flat config)                                                                                  |
| Format           | Prettier                                                                                                                  |
| Pre-commit       | husky + lint-staged                                                                                                       |
| CI               | GitHub Actions (`.github/workflows/ci.yml`) — lint, typecheck, test, build                                                |
| Deploy           | GitHub Actions (`.github/workflows/deploy.yml`) — builds `dist/web` and publishes to GitHub Pages on every push to `main` |

## Adding a new platform (e.g. a native/Electron renderer)

1. Implement `IRendererService` (and any other ports you need) in a new
   `adapters/<platform>/` directory.
2. Add a `compose<Platform>Services()` function in `composition/` that wires
   the new adapter together with the existing `core/application` services.
   Do not add a branch to an existing composition root — each entry point
   gets its own, so unrelated platforms' native dependencies never end up
   in each other's module graphs.
3. Add a thin entry point that calls your new composition function.
