# Deployment

_[← Technology layer](./README.md)_

**ArchiMate elements:** Node, Artifact, Deployment/Communication relationships.

## Nodes and artifacts

| Node                               | Artifacts it hosts                                            | Origin                          |
| ---------------------------------- | ------------------------------------------------------------- | ------------------------------- |
| **Visitor's browser**              | `dist/web/*.html`, JS/CSS bundles, `index.html`…`create.html` | Fetched from GitHub Pages       |
| **GitHub Actions runner (CI)**     | Checked-out repo, `node_modules`, ESLint/TS/Vitest reports    | Ephemeral, per workflow run     |
| **GitHub Actions runner (deploy)** | `dist/web/` build artifact                                    | Produced by `npm run build`     |
| **GitHub Pages**                   | Published `dist/web/`                                         | Deployed by the deploy workflow |
| **Developer / CLI machine**        | Repo checkout, `fractals.db`, `logs/*.json`, generated PNGs   | Local `npm run cli -- generate` |

## Two independent deployables from one build

```mermaid
flowchart TB
  src["«Artifact»<br>src/ (TypeScript core + adapters)"]:::technology

  subgraph webPath["Web delivery"]
    viteb["vite build"]:::technology
    distweb["«Artifact»<br>dist/web/<br>(5 static pages)"]:::technology
    pagesHost["«Node»<br>GitHub Pages"]:::technology
  end

  subgraph cliPath["CLI delivery"]
    tscb["tsc -p tsconfig.json"]:::technology
    distcli["«Artifact»<br>dist/ (CLI JS)"]:::technology
    localrun["«Node»<br>Local machine process"]:::technology
    png["«Artifact»<br>output PNG"]:::technology
    db["«Artifact»<br>fractals.db + logs/*.json"]:::technology
  end

  src --> viteb --> distweb -->|deployed to| pagesHost
  src --> tscb --> distcli -->|executed on| localrun
  localrun --> png
  localrun --> db

  classDef technology fill:#c9e7b7,stroke:#558b2f,color:#333
```

**Note:** only `FractalService` (the tree) currently runs in the CLI path —
`TurtleFractalService`/`SnowflakeService` are web-only today (see the CLI
parity gap in [project-scope.md](../project-scope.md)); the shared
`IRendererService` port means adding a CLI path is composition-only work.

## CI/CD pipeline

```mermaid
flowchart LR
  push(("push / PR")):::technology
  checkout["Checkout + npm ci"]:::technology
  lint["Lint (ESLint)"]:::technology
  typecheck["Typecheck (tsc)"]:::technology
  test["Test (Vitest, 51 tests)"]:::technology
  build["Build (vite build)"]:::technology
  gate{"All green?"}:::technology
  merge(("merge to main")):::technology
  deploybuild["Build for deploy"]:::technology
  publish["Publish dist/web<br>to GitHub Pages"]:::technology

  push --> checkout --> lint --> typecheck --> test --> build --> gate
  gate -->|yes| merge
  merge -->|triggers| deploybuild --> publish

  classDef technology fill:#c9e7b7,stroke:#558b2f,color:#333
```

Workflows: `.github/workflows/ci.yml` (gate, every push/PR),
`.github/workflows/deploy.yml` (build + publish, on push to `main`).
One-time setup: repository **Settings → Pages → Source: GitHub Actions**.
No secrets or paid services required — consistent with the zero-cost driver
in [strategy/motivation.md](../strategy/motivation.md).

## Environment requirements

| Environment    | Requirement                                                                              | Why                           |
| -------------- | ---------------------------------------------------------------------------------------- | ----------------------------- |
| Web (browser)  | None beyond a modern browser with Canvas2D                                               | Pure static assets            |
| CLI / CI build | Node.js ≥ 18; Cairo/Pango/libjpeg/libgif/librsvg system libraries (`libcairo2-dev` etc.) | `node-canvas` native bindings |
| Local dev      | `npm install`, `npm run dev` (Vite dev server, port 3000)                                | Hot-reloading iteration       |
