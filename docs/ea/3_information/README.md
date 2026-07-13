# Information Layer

_[← EA home](../README.md)_

The passive structure of the architecture: the data objects that represent
the [business objects](../2_business/4_business-objects.md), and how information
flows and persists.

## Analysis order

Files are numbered in the order they are analyzed: first _what information
exists_, then _how it moves and is represented_, and finally _how it is
physically stored, classified, and retained_.

| #   | Document                                           | Elements                                             | Question it answers                                |
| --- | -------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| 1   | [1_data-objects.md](./1_data-objects.md)           | Data Objects (domain types) and their code locations | What information exists?                           |
| 2   | [2_data-flows.md](./2_data-flows.md)               | Representations, persistence and flow relationships  | How does it move between representations?          |
| 3   | [3_data-architecture.md](./3_data-architecture.md) | ER model, physical schema, classification, retention | Where does it live, how sensitive is it, how long? |

## Layer view

```mermaid
flowchart TB
  subgraph CORE["Core domain (src/core/domain)"]
    fp["«Data Object»<br>FractalParams"]:::application
    tp["«Data Object»<br>TurtleProgram"]:::application
    sp["«Data Object»<br>SnowflakeParams"]:::application
    t3p["«Data Object»<br>Tree3DParams /<br>Segment3D scene"]:::application
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
  t3p -->|drawn to| png
  tp -.->|invalid input yields| fe
  log -->|persisted in| db
  url -->|resolves| ls

  classDef business fill:#fffbb5,stroke:#b8a200,color:#333
  classDef application fill:#c2f0ff,stroke:#0288d1,color:#333
  classDef technology fill:#c9e7b7,stroke:#558b2f,color:#333
```
