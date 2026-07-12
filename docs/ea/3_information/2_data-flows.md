# Data Flows and Persistence

_[← Information layer](./README.md)_

**ArchiMate elements:** Representation, Flow, Access relationships.

## Where information lives

The studio is a static site: **no server-side state exists**. Everything the
visitor produces or configures lives in one of four places:

| Store                                           | Contents                    | Lifetime                        |
| ----------------------------------------------- | --------------------------- | ------------------------------- |
| URL query (`?lang=es`)                          | Language choice             | As long as the link is shared   |
| Browser `localStorage`                          | `ftree-theme`, `ftree-lang` | Until cleared by the user       |
| Canvas (in-memory raster)                       | The current Artwork         | Until regenerate/clear/navigate |
| Downloaded PNG                                  | Exported Artwork            | User's filesystem               |
| SQLite `fractals.db` + `logs/*.json` (CLI only) | Generation Records          | Local machine                   |

## Flow 1 — Formula, in and out of its representations

The same Fractal Rule exists as three synchronized representations on the
create page. The AST is canonical; the others are projections.

```mermaid
flowchart LR
  text["«Representation»<br>Formula text<br><i>F1 [+25 T0.7] [-25 T0.7]</i>"]:::business
  ast["«Data Object»<br>TurtleProgram (AST)<br><b>canonical state</b>"]:::application
  rows["«Representation»<br>Builder step rows"]:::business
  canvas["«Representation»<br>Canvas drawing"]:::business
  err["«Data Object»<br>FormulaError[]"]:::application

  text -->|"parseFormula (debounced 300 ms)"| ast
  ast -->|serializeFormula| text
  ast -->|renders| rows
  rows -->|"mutate in place"| ast
  ast -->|"run (last valid only)"| canvas
  text -.->|"on failure"| err
  err -.->|"positioned message (i18n)"| text

  classDef business fill:#fffbb5,stroke:#b8a200,color:#333
  classDef application fill:#c2f0ff,stroke:#0288d1,color:#333
```

Invariants: invalid text is **never rewritten**; the canvas always shows the
**last valid** program; round-trip parse∘serialize ≡ identity.

## Flow 2 — Language preference

```mermaid
flowchart LR
  link["«Representation»<br>Shared link ?lang=es"]:::business
  resolver["initI18n()<br>URL beats storage beats default"]:::application
  ls[("localStorage<br>ftree-lang")]:::technology
  page["Rendered page<br>(data-i18n + dynamic t())"]:::business
  links["Internal links<br>(rewritten with ?lang=)"]:::business

  link -->|flow| resolver
  ls -->|access read| resolver
  resolver -->|access write| ls
  resolver -->|renders| page
  page -->|localizeInternalLinks| links
  links -->|"next page keeps language"| link

  classDef business fill:#fffbb5,stroke:#b8a200,color:#333
  classDef application fill:#c2f0ff,stroke:#0288d1,color:#333
  classDef technology fill:#c9e7b7,stroke:#558b2f,color:#333
```

## Flow 3 — CLI generation record (write-twice)

The CLI logs each generation to SQLite **then** to a JSON file (with the
SQLite id merged in). The dual write and its divergence risk are contracted
in [interface contracts](../4_application/5_interface-contracts.md) and analyzed in
[data architecture](./3_data-architecture.md).

```mermaid
flowchart LR
  gen["Tree generation<br>(CLI)"]:::application
  entry["«Data Object»<br>FractalLogEntry"]:::application
  db[("«Artifact»<br>fractals.db (SQLite)")]:::technology
  json[("«Artifact»<br>logs/fractal-*.json")]:::technology
  png[("«Artifact»<br>output PNG")]:::technology

  gen -->|produces| entry
  gen -->|writes| png
  entry -->|"1. insert (returns id)"| db
  entry -->|"2. write with id"| json

  classDef application fill:#c2f0ff,stroke:#0288d1,color:#333
  classDef technology fill:#c9e7b7,stroke:#558b2f,color:#333
```

## Data classification

All data is either **public content** (the site itself) or **user-local**
(preferences, artwork, CLI logs). No personal data is collected, transmitted
or stored remotely; there are no cookies, analytics or accounts. This is a
deliberate consequence of the zero-cost/no-backend driver in
[strategy/1_motivation.md](../1_strategy/1_motivation.md).
