# Application Components

_[← Application layer](./README.md)_

**ArchiMate element:** Application Component — structural units of software,
each mapped to its real source location so this document stays verifiable.

## Page entry points (one per journey chapter)

| Component           | Chapter       | Source                                             | Composes                                                 |
| ------------------- | ------------- | -------------------------------------------------- | -------------------------------------------------------- |
| Story page          | 1 — Why?      | `src/adapters/web/story.ts` + `index.html`         | `composeWebServices`                                     |
| Learn page          | 2 — How?      | `src/adapters/web/learn.ts` + `learn.html`         | `composeWebServices` ×8 (one per demo canvas)            |
| Tree generator page | 3 — Create!   | `src/adapters/web/main.ts` + `generator.html`      | `composeWebServices`, `ControlsView`                     |
| Snowflake page      | 4 — Snowflake | `src/adapters/web/snowflake.ts` + `snowflake.html` | `composeSnowflakeServices`, `SnowflakeControls`          |
| Create page         | 5 — Your rule | `src/adapters/web/create.ts` + `create.html`       | `composeTurtleServices`, `FormulaBox`, `RuleBuilderView` |

## Core application components (platform-free, `src/core/`)

| Component              | Source                                     | Responsibility                                                            |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------------------- |
| `FractalService`       | `core/application/FractalService.ts`       | Recursive two-child tree algorithm                                        |
| `TurtleFractalService` | `core/application/TurtleFractalService.ts` | Generic turtle-program interpreter with symmetry, jitter, segment budget  |
| `SnowflakeService`     | `core/application/SnowflakeService.ts`     | Façade: `SnowflakeParams` → dendrite `TurtleProgram`                      |
| Formula toolchain      | `core/application/turtle/formula.ts`       | `parseFormula`, `serializeFormula`, `validateProgram`, `estimateSegments` |
| `ConfigService`        | `core/application/ConfigService.ts`        | Tree defaults + clamping                                                  |
| `SpeedControlService`  | `core/application/SpeedControlService.ts`  | Animation delay                                                           |
| `math.ts`              | `core/application/math.ts`                 | `sampleInterval`, `clamp`, color helpers                                  |

## Adapter components

| Component                                | Source                                       | Realizes                                                        |
| ---------------------------------------- | -------------------------------------------- | --------------------------------------------------------------- |
| `WebRendererService`                     | `adapters/web/WebRendererService.ts`         | `IRendererService` via Canvas2D, animated strokes, PNG download |
| `NodeCanvasRendererService`              | `adapters/node/NodeCanvasRendererService.ts` | `IRendererService` via `node-canvas`, PNG file write            |
| `FractalLogRepository` / `LoggerService` | `adapters/node/*.ts`                         | `IFractalLogRepository` / `ILoggerService` (SQLite + JSON)      |

## Shared web UI components

| Component                        | Source                                        | Used by                                                        |
| -------------------------------- | --------------------------------------------- | -------------------------------------------------------------- |
| `routes.ts`                      | `adapters/web/routes.ts`                      | `chrome.ts` (single source of the chapter list)                |
| `chrome.ts`                      | `adapters/web/chrome.ts`                      | Every page (header, badge, pager, theme/lang wiring)           |
| `i18n.ts`                        | `adapters/web/i18n.ts`                        | Every page                                                     |
| `theme.ts`                       | `adapters/web/theme.ts`                       | Every page                                                     |
| `serialRunner.ts`                | `adapters/web/serialRunner.ts`                | `main.ts`, `story.ts`, `learn.ts`, `snowflake.ts`, `create.ts` |
| `controls/widgets.ts`            | `adapters/web/controls/widgets.ts`            | `ControlsView.ts`, `SnowflakeControls.ts`, `create.ts`         |
| `ControlsView.ts`                | `adapters/web/ControlsView.ts`                | Tree page                                                      |
| `SnowflakeControls.ts`           | `adapters/web/SnowflakeControls.ts`           | Snowflake page                                                 |
| `rulebuilder/FormulaBox.ts`      | `adapters/web/rulebuilder/FormulaBox.ts`      | Create page (text half of sync)                                |
| `rulebuilder/RuleBuilderView.ts` | `adapters/web/rulebuilder/RuleBuilderView.ts` | Create page (visual half of sync)                              |

## Composition roots and CLI

| Component            | Source                           | Responsibility                                                                                           |
| -------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `WebComposition.ts`  | `composition/WebComposition.ts`  | `composeWebServices`, `composeTurtleServices`, `composeSnowflakeServices` — one service graph per canvas |
| `NodeComposition.ts` | `composition/NodeComposition.ts` | Wires `FractalService` to Node adapters for the CLI                                                      |
| `cli.ts`             | `src/cli.ts`                     | `generate` / `history` commands                                                                          |

## Component diagram

```mermaid
flowchart TB
  subgraph pages["Page components"]
    createp["«Application Component»<br>create.ts"]:::application
    snowp["«Application Component»<br>snowflake.ts"]:::application
    genp["«Application Component»<br>main.ts"]:::application
  end

  subgraph ui["Shared web UI components"]
    chrome["«Application Component»<br>chrome.ts"]:::application
    routes["«Application Component»<br>routes.ts"]:::application
    widgets["«Application Component»<br>controls/widgets.ts"]:::application
    fbox["«Application Component»<br>FormulaBox"]:::application
    rbuild["«Application Component»<br>RuleBuilderView"]:::application
  end

  subgraph coreC["Core components"]
    fs["«Application Component»<br>FractalService"]:::application
    ts["«Application Component»<br>TurtleFractalService"]:::application
    sf["«Application Component»<br>SnowflakeService"]:::application
    formula["«Application Component»<br>formula.ts"]:::application
  end

  comp["«Application Component»<br>WebComposition"]:::application

  chrome -->|reads| routes
  genp --> chrome
  snowp --> chrome
  createp --> chrome
  genp -->|via| comp
  snowp -->|via| comp
  createp -->|via| comp
  comp -->|instantiates| fs
  comp -->|instantiates| ts
  comp -->|instantiates| sf
  sf -->|delegates to| ts
  createp --> fbox
  createp --> rbuild
  fbox -->|uses| formula
  rbuild -->|uses| formula
  genp --> widgets
  snowp --> widgets

  classDef application fill:#c2f0ff,stroke:#0288d1,color:#333
```
