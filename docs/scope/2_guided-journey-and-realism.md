# Project Scope — Guided Journey & Tree Realism

_[← Scope index](./README.md) · [EA home](../ea/README.md)_

**ArchiMate viewpoint:** Implementation & Migration.
**Delivered as:** PR #4 (branch `claude/tree-generation-realism-whhr0v`).

> **Retrospective record.** This initiative predates the EA-first process;
> the summary below is reconstructed from the git history so the scope
> series is complete from the beginning.

## Plateaus

| Plateau                | State                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Baseline** (before)  | A standalone generator page plus a separate "how it works" page; fixed-value parameters; English only; dark only.      |
| **Target** (delivered) | A three-chapter guided journey (Why → How → Generate) with interval-based realism, EN/ES i18n, and light/dark theming. |

## Work packages (reconstructed)

- **WP1 — Interval-based realism**: `depth`, `angle`, and `lengthFactor`
  became ranges (dual-thumb sliders) sampled per branch; "wildness" scales
  how much of each range is used.
- **WP2 — i18n and theming**: EN/ES language switcher persisted in the URL
  (`?lang=es`); light/dark theme following the device with a toggle.
- **WP3 — Journey restructure**: the site became a numbered three-chapter
  journey with a shared visual language and a friendlier learn page.

## Gap notes

- Navigation chrome was still copy-pasted per page; extracted into a
  route-driven module by initiative
  [#3](./3_snowflake-and-custom-fractals.md).
