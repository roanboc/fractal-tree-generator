# Business Processes

_[← Business layer](./README.md)_

**ArchiMate element:** Business Process — sequences of behavior that realize
the [business services](./business-services.md).

## P1 — Guided journey (the flagship process)

The visitor-facing process realizing the whole
[value stream](../strategy/value-stream.md). Linear by design; every page
offers prev/next pagers and a numbered header so visitors always know where
they are.

```mermaid
flowchart LR
  e0(("visit")):::business
  p1["«Business Process»<br>Be inspired<br><i>Ch. 1</i>"]:::business
  p2["«Business Process»<br>Learn the rule<br><i>Ch. 2</i>"]:::business
  p3["«Business Process»<br>Grow a tree<br><i>Ch. 3</i>"]:::business
  p4["«Business Process»<br>Craft a snowflake<br><i>Ch. 4</i>"]:::business
  p5["«Business Process»<br>Author a rule<br><i>Ch. 5</i>"]:::business
  art["«Business Object»<br>Artwork (PNG)"]:::business

  e0 -->|triggers| p1 --> p2 --> p3 --> p4 --> p5
  p3 -.->|produces| art
  p4 -.->|produces| art
  p5 -.->|produces| art

  classDef business fill:#fffbb5,stroke:#b8a200,color:#333
```

## P2 — Create-a-fractal (chapter 5 inner loop)

The authoring process inside chapter 5. Two entry paths (text or visual)
converge on one canonical rule; drawing never blocks on an invalid rule.

```mermaid
flowchart TB
  start(("start")):::business
  preset["Load a known-fractal preset<br><i>(or start from the tree default)</i>"]:::business
  editT["Edit the text formula"]:::business
  editB["Edit visual steps"]:::business
  val{"Rule valid?"}:::business
  fix["Read positioned error message,<br>fix the formula"]:::business
  draw["Watch the fractal draw<br>(last valid rule)"]:::business
  tune["Tune repetitions, symmetry,<br>size, origin, colors, wildness"]:::business
  save["Save PNG"]:::business

  start --> preset
  preset --> editT
  preset --> editB
  editT --> val
  editB --> val
  val -->|no| fix --> editT
  val -->|yes| draw --> tune --> draw
  draw --> save

  classDef business fill:#fffbb5,stroke:#b8a200,color:#333
```

Realized by the two-way sync collaboration documented in
[application/application-collaborations.md](../application/application-collaborations.md).

## P3 — Localization

| Step                | Behavior                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Language resolution | URL `?lang=` beats stored preference beats English default                                                               |
| Switching           | Header EN/ES buttons re-render every page fragment (static via `data-i18n`, dynamic via re-render on `ftree:langchange`) |
| Propagation         | Internal links are rewritten so the language survives navigation and shared URLs                                         |

Realized by `src/adapters/web/i18n.ts` + `chrome.ts`; the rule "no
user-facing string outside the dictionary" is
[Principle 5](../strategy/motivation.md#principles-principle).

## P4 — Release

The maintainer-facing process; fully automated after merge.

```mermaid
flowchart LR
  dev["«Business Process»<br>Develop on branch"]:::business
  pr["«Business Process»<br>Open & review PR"]:::business
  ci["«Business Process»<br>CI gate<br>lint · typecheck · test · build"]:::business
  merge["«Business Process»<br>Merge to main"]:::business
  deploy["«Business Process»<br>Auto-deploy to GitHub Pages"]:::business

  dev --> pr --> ci --> merge -->|triggers| deploy

  classDef business fill:#fffbb5,stroke:#b8a200,color:#333
```

Technology realization: [technology/deployment.md](../technology/deployment.md).
