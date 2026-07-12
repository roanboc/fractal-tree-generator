# Application Layer

_[← EA home](../README.md)_

The software that realizes the [business services](../business/business-services.md):
application services, the components providing them, and how the components
collaborate. The class-level design is in
[ARCHITECTURE.md](../../../ARCHITECTURE.md); port contracts in
[CONTRACTS.md](../../CONTRACTS.md).

| Document                                                         | Elements                                                    |
| ---------------------------------------------------------------- | ----------------------------------------------------------- |
| [application-services.md](./application-services.md)             | Application Services and the business services they realize |
| [application-components.md](./application-components.md)         | Application Components, mapped to source files              |
| [application-collaborations.md](./application-collaborations.md) | Collaborations and interaction sequences                    |

## Layer view (ports-and-adapters)

```mermaid
flowchart TB
  subgraph PAGES["Page components (entry points)"]
    story["«Application Component»<br>Story page (story.ts)"]:::application
    learn["«Application Component»<br>Learn page (learn.ts)"]:::application
    genp["«Application Component»<br>Tree page (main.ts)"]:::application
    snowp["«Application Component»<br>Snowflake page (snowflake.ts)"]:::application
    createp["«Application Component»<br>Create page (create.ts)"]:::application
  end

  subgraph CORE["Platform-free core (src/core)"]
    fs["«Application Component»<br>FractalService"]:::application
    ts["«Application Component»<br>TurtleFractalService"]:::application
    sf["«Application Component»<br>SnowflakeService"]:::application
    formula["«Application Component»<br>Formula toolchain"]:::application
    ports["«Application Interface»<br>Ports (IRendererService, …)"]:::application
  end

  subgraph ADAPT["Adapters"]
    webr["«Application Component»<br>WebRendererService<br>(Canvas2D)"]:::application
    noder["«Application Component»<br>NodeCanvasRendererService"]:::application
  end

  cli["«Application Component»<br>CLI (cli.ts)"]:::application

  story -->|uses| fs
  learn -->|uses| fs
  genp -->|uses| fs
  snowp -->|uses| sf
  createp -->|uses| ts
  createp -->|uses| formula
  sf -->|delegates to| ts
  fs -->|via| ports
  ts -->|via| ports
  ports -->|realized by| webr
  ports -->|realized by| noder
  cli -->|uses| fs

  classDef application fill:#c2f0ff,stroke:#0288d1,color:#333
```

Composition roots (`src/composition/WebComposition.ts`,
`NodeComposition.ts`) are the only places concrete adapters are wired to the
core — one service graph per canvas.
