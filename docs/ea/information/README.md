# Information Layer

_[← EA home](../README.md)_

The passive structure of the architecture: the data objects that represent
the [business objects](../business/business-objects.md), and how information
flows and persists. Complements the entity-level detail in
[DATA_ARCHITECTURE.md](../../DATA_ARCHITECTURE.md).

| Document                             | Elements                                             |
| ------------------------------------ | ---------------------------------------------------- |
| [data-objects.md](./data-objects.md) | Data Objects (domain types) and their code locations |
| [data-flows.md](./data-flows.md)     | Representations, persistence and flow relationships  |

## Layer view

```mermaid
flowchart TB
  subgraph CORE["Core domain (src/core/domain)"]
    fp["«Data Object»<br>FractalParams"]:::application
    tp["«Data Object»<br>TurtleProgram"]:::application
    sp["«Data Object»<br>SnowflakeParams"]:::application
    fe["«Data Object»<br>FormulaError"]:::application
    rr["«Data Object»<br>RenderResult /<br>TurtleRenderResult"]:::application
    log["«Data Object»<br>FractalLogEntry"]:::application
  end

  subgraph EDGE["Edge representations"]
    dsl["«Representation»<br>Formula text (DSL)"]:::business
    png["«Representation»<br>PNG file"]:::business
    url["«Representation»<br>URL ?lang="]:::business
    ls["«Representation»<br>localStorage prefs"]:::business
    db[("«Artifact»<br>SQLite + JSON logs")]:::technology
  end

  dsl <-->|parse / serialize| tp
  fp -->|drawn to| png
  tp -->|drawn to| png
  sp -->|expands into| tp
  tp -.->|invalid input yields| fe
  log -->|persisted in| db
  url -->|resolves| ls

  classDef business fill:#fffbb5,stroke:#b8a200,color:#333
  classDef application fill:#c2f0ff,stroke:#0288d1,color:#333
  classDef technology fill:#c9e7b7,stroke:#558b2f,color:#333
```
