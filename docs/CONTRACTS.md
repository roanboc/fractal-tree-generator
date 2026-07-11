# Interface Contracts

_[← README](../README.md) · [ARCHITECTURE](../ARCHITECTURE.md) · [BUSINESS_CONTEXT](./BUSINESS_CONTEXT.md) · [DATA_ARCHITECTURE](./DATA_ARCHITECTURE.md)_

This document is the contract for every port in `src/core/ports.ts` — what
each method promises, what it requires from the caller, what it guarantees
on return, and how it fails. Treat this as the source of truth when
implementing a new adapter or reviewing a change to an existing one: an
adapter that satisfies the TypeScript type signature but not the contract
described here is still a bug.

Value types referenced below (`FractalParams`, `FractalColors`,
`CanvasConfig`, `RenderResult`, `FractalLogEntry`) are defined in
`src/core/domain/types.ts`.

---

## `IFractalService`

**Responsibility:** owns the recursive tree-drawing algorithm. The single
place business logic (jitter, tapering, color transitions, branch
counting) is allowed to live.

**Implemented by:** `core/application/FractalService.ts`
**Consumed by:** `adapters/web/main.ts`, `src/cli.ts` (via the composition roots)

### `generate(params: FractalParams): Promise<RenderResult>`

- **Preconditions:** `params` should be a fully-populated `FractalParams`.
  In practice this method re-validates via the injected `IConfigService`
  internally, so passing an already-validated object is not required for
  correctness — but the type signature requires a full object, not a
  `Partial`, so callers should validate first for type-safety at the call
  site.
- **Postconditions:**
  - `renderer.initialize()` is called exactly once, with a fixed
    800×600 canvas and background `#1a1a2e`. Canvas dimensions are **not**
    configurable via `FractalParams` today — see
    [docs/DATA_ARCHITECTURE.md](./DATA_ARCHITECTURE.md) for the fixed
    constants.
  - `renderer.drawBranch()` is called exactly `2^depth - 1` times (a full
    binary tree — the algorithm never prunes early).
  - Returns a `RenderResult` with `outputPath: ''` — the caller is
    responsible for persisting the render (via `renderer.save()`) and
    filling in the real path; `FractalService` has no filesystem
    awareness.
- **Invariants:** `branchCount` is instance state that resets to `0` at
  the start of every `generate()` call. **A single `FractalService`
  instance is not safe for concurrent/overlapping `generate()` calls** —
  two in-flight calls on the same instance will corrupt each other's
  branch count. Each composition root creates one `FractalService` per
  process/session, which is sufficient for this app's single-user usage,
  but this would need to change (e.g. per-call local state) before
  reusing one instance across concurrent requests.
- **Errors:** does not catch anything. Any error thrown by the injected
  `IRendererService` or `ISpeedControlService` propagates to the caller
  unmodified.

### `clear(): void`

- Delegates directly to `renderer.clear()`. No validation, no state reset
  beyond what the renderer itself does.

---

## `IRendererService`

**Responsibility:** draws primitive line segments onto _some_ canvas
surface, and can persist that surface. This is the seam between the
platform-agnostic algorithm and a concrete rendering target.

**Implemented by:** `adapters/web/WebRendererService.ts` (browser
Canvas2D), `adapters/node/NodeCanvasRendererService.ts` (`node-canvas`)

### `initialize(config: CanvasConfig): void`

- **Preconditions:** none for the Node adapter. The web adapter requires a
  `<canvas id="fractalCanvas">` element to already exist in the DOM —
  calling this before the page has rendered that element throws.
- **Postconditions:** the canvas is resized to `config.width` ×
  `config.height` and filled with `config.backgroundColor`. Any prior
  drawing is discarded (both adapters recreate/refill the backing
  surface).
- Must be called before `drawBranch()`; both adapters assume `this.ctx`
  is initialized and will throw a null-reference error otherwise.

### `drawBranch(x, y, length, angle, lineWidth, color): void`

- Draws one line segment from `(x, y)` at the given `angle` (radians,
  standard math convention — `0` is +x, increasing counter-clockwise) for
  `length` pixels, with the given `lineWidth` and `color` (any valid CSS
  color string).
- **Postconditions:** exactly one stroked path is added to the canvas.
  Does not return the endpoint — callers that need it (i.e.
  `FractalService`) compute it themselves with the same trigonometry.
- No parameter validation — out-of-range values (negative length,
  non-finite numbers) are passed straight to the underlying 2D context
  and will produce whatever that context does with them (typically: a
  degenerate or invisible stroke, not a thrown error).

### `save(outputPath: string): Promise<void>`

- **Node adapter:** writes a PNG to `outputPath`, creating parent
  directories as needed.
- **Web adapter:** `outputPath` is **ignored** — it triggers a browser
  download of the canvas as `fractal-tree.png` instead, since a browser
  tab has no filesystem to write to. This is the one method whose
  behavior meaningfully diverges between adapters; callers that depend on
  the actual save location (the CLI does, for logging) must not assume
  `save()` respects `outputPath` on every adapter.

### `clear(): void`

- **Node adapter:** clears the in-memory canvas buffer only; has no
  effect once `save()` has already written a file.
- **Web adapter:** clears to full transparency (`clearRect`), **not**
  back to `backgroundColor`. Visually this currently looks correct only
  because the page background happens to match; a future change to the
  page background would expose this.

---

## `IConfigService`

**Responsibility:** the single source of truth for default parameter
values and the only place range-clamping happens.

**Implemented by:** `core/application/ConfigService.ts`

### `getDefaults(): FractalParams`

- **Postconditions:** returns a **new, independent copy** on every call
  (including a fresh copy of the nested `colors` object). Callers may
  freely mutate the returned object without affecting future calls or
  other callers — this is deliberate and covered by a unit test
  (`tests/core/ConfigService.test.ts`).

### `validate(params: Partial<FractalParams>): FractalParams`

- **Preconditions:** none — every field is optional.
- **Postconditions:** returns a full `FractalParams` where:
  - every field present in `params` overrides the default, then every
    numeric field is clamped into its constraint range (see the table in
    [BUSINESS_CONTEXT.md](./BUSINESS_CONTEXT.md#business-rules-and-their-rationale));
  - `colors` is merged key-by-key against the default palette, so a
    caller can override just `trunk` without needing to supply `leaf`
    and `accent`.
- **Idempotent:** `validate(validate(x))` produces the same result as
  `validate(x)` for any `x` — safe to call more than once on the same
  data (as `FractalService.generate()` implicitly does).

---

## `ISpeedControlService`

**Responsibility:** the single point of control for the artificial delay
between branches (used to animate the web canvas or slow down CLI output
for demos).

**Implemented by:** `core/application/SpeedControlService.ts`

### `setDelay(ms: number): void`

- Clamps `ms` into `[0, 10000]` before storing it. Out-of-range input is
  silently corrected, never rejected.

### `getDelay(): number`

- Returns the last clamped value set via `setDelay`, or `0` if never
  called.

### `isEnabled(): boolean`

- Equivalent to `getDelay() > 0`. Provided so callers don't need to know
  the "0 means disabled" convention themselves.

### `wait(): Promise<void>`

- Resolves immediately (no macrotask scheduled) when the delay is `0`, to
  avoid adding an event-loop tick to every branch draw in the common
  "instant" case. Otherwise resolves after `setTimeout(ms)`.

---

## `ILoggerService`

**Responsibility:** records the outcome of a generation for later review.
CLI-only today — there is no web implementation, and none is planned,
since a browser session has no durable server-side storage to log to.

**Implemented by:** `adapters/node/LoggerService.ts`

### `log(entry: FractalLogEntry): Promise<void>`

- **Postconditions:** the entry is written to **two** places, in this
  order:
  1. `IFractalLogRepository.insert()` (SQLite) — the returned `id` is
     merged back onto the entry.
  2. A JSON file under `logs/fractal-<timestamp>.json`, containing the
     entry **with** the SQLite-assigned `id`.
  - Both writes must succeed for `log()` to resolve; if the JSON write
    fails after the SQLite insert has already committed, the two stores
    diverge (SQLite has the row, `logs/` does not). There is currently no
    compensating transaction for this — see
    [docs/DATA_ARCHITECTURE.md](./DATA_ARCHITECTURE.md) for the
    recommended mitigation if this becomes a real risk.

### `getRecent(limit: number): Promise<FractalLogEntry[]>`

- Pure pass-through to `repository.findRecent(limit)`, wrapped in a
  Promise for interface symmetry (the underlying SQLite call is
  synchronous).

---

## `IFractalLogRepository`

**Responsibility:** persistence-only abstraction over the `fractal_logs`
SQLite table. Contains no business logic — it does not validate
`FractalLogEntry`, only stores and retrieves it.

**Implemented by:** `adapters/node/FractalLogRepository.ts`

### `insert(entry: FractalLogEntry): number`

- **Postconditions:** returns the SQLite-assigned auto-increment `id`
  (`entry.id`, if set by the caller, is ignored — the database is always
  the source of truth for `id`).
- Synchronous (better-sqlite3 is a synchronous driver); the `ILoggerService`
  interface wraps it in a Promise for consistency with the rest of the
  port surface.

### `findRecent(limit: number): FractalLogEntry[]`

- Returns up to `limit` entries, ordered newest-first (`ORDER BY id DESC`).
- No pagination cursor — callers needing more than the most recent
  `limit` rows have no way to page further with the current contract.

### `findById(id: number): FractalLogEntry | null`

- Returns `null` (not `undefined`, not a thrown error) when no row
  matches.

---

## Adding a new port

1. Define the interface in `core/ports.ts`, using only types from
   `core/domain/types.ts` (or new types you add there) — never a
   platform-specific type (no `HTMLCanvasElement`, no Node's `Buffer`) in
   a port signature.
2. Document it here, following the format above: responsibility,
   implementers, then one subsection per method covering preconditions,
   postconditions, invariants, and error behavior.
3. Add at least one unit test against a fake/mock implementation in
   `tests/core/`, the same way `tests/core/FractalService.test.ts` uses a
   spy `IRendererService`.
