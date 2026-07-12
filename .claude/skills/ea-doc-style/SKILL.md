---
name: ea-doc-style
description: Use when creating or editing any document under docs/ea/ or docs/scope/ — numbering, ArchiMate-on-Mermaid notation, grounding rules, and link conventions for this repo's documentation.
---

# EA documentation style

## Numbering

- Layer folders are numbered in assessment order and never reordered:
  `1_strategy`, `2_business`, `3_information`, `4_application`,
  `5_technology`.
- Files inside a layer carry a numeric prefix giving the **logical analysis
  order**, which each layer README explains in an "Analysis order" table.
  A new file gets the next number, plus a row in that table; only renumber
  when the analysis order genuinely changes.
- Scope documents (`docs/scope/`) are numbered **chronologically** per
  initiative.

## Grounding rule (the most important one)

Every EA element must name the code artifact that realizes it — a page, a
module path, a pipeline file. If you cannot point at the realizing
artifact, either the element doesn't belong in the docs or the code is
missing; say which. This keeps the whole set verifiable against the code.

## ArchiMate on Mermaid

Full conventions are in `docs/ea/README.md`; in short:

- Element type as a «stereotype» in the first label line:
  `«Business Service»`, `«Application Component»`, `«Data Object»`, …
- One `classDef` per layer, using the palette table in `docs/ea/README.md`
  (`motivation` violet, `strategy` sand, `business` yellow, `application`
  cyan, `technology` green, `implementation` rose).
- Relationships labeled with their ArchiMate name (**serves**, **realizes**,
  **assigned to**, **accesses**, **triggers**, **flow**, **aggregates**,
  **influences**); the label is authoritative where arrowheads can't
  distinguish types.

## Document skeleton

- Title (`# …`), then a nav line:
  `_[← <Layer> layer](./README.md) · [EA home](../README.md)_`
  (scope docs link to the scope index instead).
- State the **ArchiMate elements/viewpoint** covered near the top.
- Prefer tables for element inventories, Mermaid for relationships, prose
  only for rationale.

## Links

- Always relative, always to a specific file (`../2_business/README.md`,
  not `../2_business/`), keeping `#anchors` when pointing at a section.
- Human-readable link text (`[solution design](…)`), not raw paths.
- Each fact lives in exactly one document; everything else links to it.
  If you are about to restate a table or diagram, link instead.
- When renaming or moving a doc, grep the whole repo for the old path and
  fix every reference in the same change.
