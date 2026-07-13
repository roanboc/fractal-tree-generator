# Application Layer

_[← EA home](../README.md)_

The software that realizes the [business services](../2_business/2_business-services.md):
application services, the components providing them, how the components
collaborate, and — at the finest grain — the class-level solution design and
the contracts of every port.

## Analysis order

Files are numbered in the order they are analyzed, from the coarsest view
(services offered to the business) down to the finest (per-method interface
contracts).

| #   | Document                                                             | Elements                                                    | Question it answers                              |
| --- | -------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| 1   | [1_application-services.md](./1_application-services.md)             | Application Services and the business services they realize | What does the software offer the business layer? |
| 2   | [2_application-components.md](./2_application-components.md)         | Application Components, mapped to source files              | Which components provide those services?         |
| 3   | [3_application-collaborations.md](./3_application-collaborations.md) | Collaborations and interaction sequences                    | How do the components interact?                  |
| 4   | [4_solution-design.md](./4_solution-design.md)                       | Ports & adapters design, diagrams, patterns, tooling        | How is the code structured, and why?             |
| 5   | [5_interface-contracts.md](./5_interface-contracts.md)               | Per-port pre/postconditions, invariants, error behavior     | What exactly does each interface promise?        |

## Layer view (ports-and-adapters)

```mermaid
flowchart TB
  subgraph PAGES["Page components (entry points)"]
    story["«Application Component»<br>Story page (story.ts)"]:::application
    learn["«Application Component»<br>Learn page (learn.ts)"]:::application
    genp["«Application Component»<br>Tree page (main.ts)"]:::application
    snowp["«Application Component»<br>Snowflake page (snowflake.ts)"]:::application
    createp["«Application Component»<br>Create page (create.ts)"]:::application
    t3dp["«Application Component»<br>3D tree page (tree3d.ts)"]:::application
  end

  subgraph CORE["Platform-free core (src/core)"]
    fs["«Application Component»<br>FractalService"]:::application
    ts["«Application Component»<br>TurtleFractalService"]:::application
    sf["«Application Component»<br>SnowflakeService"]:::application
    t3d["«Application Component»<br>Tree3DService"]:::application
    formula["«Application Component»<br>Formula toolchain"]:::application
    ports["«Application Interface»<br>Ports (IRendererService, …)"]:::application
  end

  subgraph ADAPT["Adapters"]
    webr["«Application Component»<br>WebRendererService<br>(Canvas2D)"]:::application
    webglr["«Application Component»<br>WebGLTreeRendererService<br>(WebGL)"]:::application
    noder["«Application Component»<br>NodeCanvasRendererService"]:::application
  end

  cli["«Application Component»<br>CLI (cli.ts)"]:::application

  story -->|uses| fs
  learn -->|uses| fs
  genp -->|uses| fs
  snowp -->|uses| sf
  createp -->|uses| ts
  createp -->|uses| formula
  t3dp -->|uses| t3d
  sf -->|delegates to| ts
  fs -->|via| ports
  ts -->|via| ports
  t3d -->|via| ports
  ports -->|realized by| webr
  ports -->|realized by| webglr
  ports -->|realized by| noder
  cli -->|uses| fs

  classDef application fill:#c2f0ff,stroke:#0288d1,color:#333
```

Composition roots (`src/composition/WebComposition.ts`,
`NodeComposition.ts`) are the only places concrete adapters are wired to the
core — one service graph per canvas.
