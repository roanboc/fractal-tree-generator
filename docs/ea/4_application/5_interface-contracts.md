# Interface Contracts

_[← Application layer](./README.md) · [EA home](../README.md)_

This document is the contract for every port in `src/core/ports.ts` — what
each method promises, what it requires from the caller, what it guarantees
on return, and how it fails. Treat this as the source of truth when
implementing a new adapter or reviewing a change to an existing one: an
adapter that satisfies the TypeScript type signature but not the contract
described here is still a bug.

Value types referenced below (`FractalParams`, `FractalColors`,
`CanvasConfig`, `RenderResult`, `FractalLogEntry`) are defined in
`src/core/domain/types.ts`; turtle-engine types (`TurtleProgram`,
`TurtleStep`, `TurtleOptions`, `TurtleRenderResult`) in
`src/core/domain/turtle.ts`; `SnowflakeParams` in
`src/core/domain/snowflake.ts`; 3D-chapter types (`Tree3DParams`,
`Segment3D`, `Vec3`, `Tree3DRenderResult`) in `src/core/domain/tree3d.ts`.

---

## `IFractalService`

**Responsibility:** owns the recursive tree-drawing algorithm. The single
place business logic (jitter, tapering, color transitions, branch
counting) is allowed to live.

**Implemented by:** `core/application/FractalService.ts`
**Consumed by:** `adapters/web/main.ts`, `src/cli.ts` (via the composition roots)

### `generate(params: FractalParamsInput): Promise<RenderResult>`

- **Preconditions:** none beyond the input type. `params` may be partial
  and may give interval parameters (`depth`, `angle`, `lengthFactor`) as
  single numbers; this method validates and normalizes via the injected
  `IConfigService` internally, filling defaults and converting numbers to
  fixed intervals.
- **Postconditions:**
  - `renderer.initialize()` is called exactly once, with the
    `CanvasConfig` injected into the `FractalService` constructor
    (default: 800×600, background `#1a1a2e`). Canvas dimensions are a
    composition-time decision, **not** part of `FractalParams` — the
    learn page composes one `FractalService` per demo canvas, each with
    its own size.
  - `renderer.drawBranch()` is called once per branch drawn. With
    `randomness: 0` and a fixed depth interval (`min === max === d`) that
    is exactly `2^d - 1` (a full binary tree). With a wider depth interval
    or `randomness > 0`, each branch tip samples its own stopping depth
    inside `[depth.min, depth.max]`, so the count varies between the
    depth-`min` skeleton and the full depth-`max` tree. The reported
    `totalBranchesDrawn` always equals the number of `drawBranch()` calls.
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

## `ITurtleFractalService`

**Responsibility:** interprets a `TurtleProgram` — a data-driven fractal
rule made of `draw` / `move` / `turn` / `group` / `recurse` steps — against
the renderer. Where `IFractalService` hardcodes the two-child tree rule,
this engine executes whatever rule it is given; the snowflake page and the
create-your-own page both run on it.

**Implemented by:** `core/application/TurtleFractalService.ts`
**Consumed by:** `adapters/web/snowflake.ts` (via `SnowflakeService`),
`adapters/web/create.ts` (via the composition roots)

### `run(program: TurtleProgram, options: Partial<TurtleOptions>): Promise<TurtleRenderResult>`

- **Preconditions:** the program should already be semantically valid
  (`validateProgram` in `core/application/turtle/formula.ts` — at most 5
  `recurse` steps, at least one `draw`, scales/turns in range). The engine
  does not re-validate structure; it only enforces runtime safety.
- **Postconditions:**
  - `renderer.initialize()` is called exactly once per `run()`.
  - The program is executed once per `options.symmetry`, each arm's
    starting heading rotated by `2π/symmetry`, from the configured origin
    (`bottom-center` or `center`).
  - `recurse` steps re-execute the whole program at `level + 1` with
    `length × scale`, restoring the turtle pose afterwards (a self-call is
    implicitly bracketed). Recursion stops at `options.depth` and below
    0.5 px segment length.
  - **Safety budget:** at most `options.maxSegments` (clamped to
    ≤ 50 000, default 20 000) segments are drawn; when the budget is
    spent the run unwinds early and resolves with `truncated: true`. A
    five-branch program at depth 8 therefore terminates instead of
    freezing the tab.
  - `segmentsDrawn` always equals the number of `drawBranch()` calls.
- **Invariants:** all run state (segment count, truncation flag, turtle
  pose) is local to each `run()` call — unlike `FractalService` there is
  no instance-level counter. Overlapping `run()` calls on one instance
  still interleave their strokes on the shared canvas, so callers
  serialize runs the same way as with `IFractalService`
  (`adapters/web/serialRunner.ts`).
- **Errors:** propagates renderer/speed-control errors unmodified, like
  `IFractalService`.

### `clear(): void`

- Delegates directly to `renderer.clear()`.

---

## `ISnowflakeService`

**Responsibility:** a thin domain façade that turns friendly snowflake
knobs (`SnowflakeParams`) into a fixed dendrite `TurtleProgram` — spike
pair plus shrinking spine, all self-calls — run with 6-fold symmetry from
the canvas center.

**Implemented by:** `core/application/SnowflakeService.ts`

### `generate(input: Partial<SnowflakeParams>): Promise<TurtleRenderResult>`

- **Preconditions:** none — every field is optional; input is merged over
  `SNOWFLAKE_DEFAULTS` and clamped (`validateSnowflakeParams`).
- **Postconditions:** with `jitter: 0` the crystal is exactly six-fold
  symmetric and draws `6 · (3^depth − 1) / 2` segments (three self-calls
  per rule). Everything else follows the `ITurtleFractalService.run()`
  contract.

---

## `ITree3DService`

**Responsibility:** owns the 3D branching rule — grows an n-child tree in
space (each split tilts away from its parent and twists around the parent's
axis) as platform-free `Segment3D` geometry and hands the finished scene to
the injected `ITree3DRendererService`.

**Implemented by:** `core/application/Tree3DService.ts`
**Consumed by:** `adapters/web/tree3d.ts` (via `composeTree3DServices`)

### `generate(input: Partial<Tree3DParams>): Promise<Tree3DRenderResult>`

- **Preconditions:** none — every field is optional; input is merged over
  `TREE3D_DEFAULTS` and clamped by `validateTree3DParams` (ranges and
  rationale in [domain context & rules](../2_business/5_domain-context-and-rules.md#3d-tree-rules-chapter-6)).
- **Postconditions:**
  - The scene is built **breadth-first** (level by level) so segments are
    ordered by `level` — renderers may use that ordering and the `level`
    field to stagger growth.
  - With the budget not hit, exactly `(branches^depth − 1) / (branches − 1)`
    segments are built (a full n-ary tree); `wildness` perturbs geometry,
    never the count.
  - **Safety budget:** at most `TREE3D_MAX_SEGMENTS` (15 000) segments are
    built; when the budget stops the build early the result carries
    `truncated: true` and, because the build is breadth-first, the missing
    segments are the outermost twigs rather than one lopsided limb.
  - `renderer.initialize()` then `renderer.presentScene()` are each called
    exactly once per `generate()`, in that order.
  - `segmentsBuilt` always equals the length of the presented scene.
- **Invariants:** all build state is local to each `generate()` call.
  Overlapping calls are safe (unlike the 2D engines): each call presents a
  complete scene atomically, so the last call to finish wins the display.
- **Errors:** propagates renderer errors unmodified.

### `clear(): void`

- Delegates directly to `renderer.clear()`.

---

## `ITree3DRendererService`

**Responsibility:** displays a finished `Segment3D` scene on _some_ 3D
surface and owns everything view-related: camera (orbit/zoom), staggered
growth reveal, optional slow spin, and PNG export. This is the seam
between the platform-free 3D rule and a concrete rendering target.

**Implemented by:** `adapters/web/WebGLTreeRendererService.ts` (raw WebGL,
no 3D library — see the course of action in
[capabilities & resources](../1_strategy/2_capabilities-and-resources.md#courses-of-action-course-of-action))

### `initialize(config: CanvasConfig): void`

- Same caller contract as `IRendererService.initialize`: the web adapter
  receives its `HTMLCanvasElement` via the constructor and never queries
  the DOM. Sets the drawing-buffer size and background color; the GL
  context and shader program are created once and reused across calls.
- If the browser cannot provide a WebGL context, the adapter degrades
  gracefully: it logs the failure and every later call becomes a no-op
  (the canvas simply stays on its CSS background) rather than throwing.

### `presentScene(segments: Segment3D[]): void`

- Replaces the displayed scene **atomically** — there is no per-segment
  drawing call for callers to interleave.
- The adapter re-frames its camera to fit the new scene's bounds, keeping
  the visitor's current orbit direction, and starts a growth reveal
  staggered by each segment's `level` (instant when the visitor prefers
  reduced motion).
- May be called with an empty array; that displays an empty (background
  only) scene.

### `setAutoRotate(enabled: boolean): void`

- Turns the slow orbital spin on or off. Purely presentational; renderers
  without a continuous display loop may treat it as a no-op.

### `save(outputPath: string): Promise<void>`

- Web adapter: `outputPath` is ignored — renders one fresh frame and
  triggers a browser download (`fractal-tree-3d.png`), mirroring
  `WebRendererService.save`.

### `clear(): void`

- Drops the scene and repaints the background from the last
  `initialize()`. Safe to call before `initialize()` (no-op).

---

## `IRendererService`

**Responsibility:** draws primitive line segments onto _some_ canvas
surface, and can persist that surface. This is the seam between the
platform-agnostic algorithm and a concrete rendering target.

**Implemented by:** `adapters/web/WebRendererService.ts` (browser
Canvas2D), `adapters/node/NodeCanvasRendererService.ts` (`node-canvas`)

### `initialize(config: CanvasConfig): void`

- **Preconditions:** none for the Node adapter. The web adapter receives
  its `HTMLCanvasElement` via its constructor (it never queries the DOM
  itself), so the caller — a composition root — is responsible for
  looking up the element and must not pass `null`.
- **Postconditions:** the canvas is resized to `config.width` ×
  `config.height` and filled with `config.backgroundColor`. Any prior
  drawing is discarded (both adapters recreate/refill the backing
  surface).
- Must be called before `drawBranch()`; both adapters assume `this.ctx`
  is initialized and will throw a null-reference error otherwise.

### `drawBranch(x, y, length, angle, lineWidth, color, strokeMs?): void | Promise<void>`

- Draws one line segment from `(x, y)` at the given `angle` (radians,
  standard math convention — `0` is +x, increasing counter-clockwise) for
  `length` pixels, with the given `lineWidth` and `color` (any valid CSS
  color string).
- `strokeMs` (default `0`) asks the renderer to animate the stroke growing
  from base to tip over that many milliseconds and return a promise that
  resolves when the stroke is complete. Renderers without animation
  support (the Node adapter) ignore it and draw instantly; callers must
  therefore `await` the result but not rely on the animation happening.
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
- **Web adapter:** repaints the canvas with the `backgroundColor` from
  the last `initialize()` call, so a cleared canvas looks identical to a
  freshly initialized one. Calling `clear()` before `initialize()` is a
  safe no-op.

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
    [domain context & rules](../2_business/5_domain-context-and-rules.md#business-rules-and-their-rationale));
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
    [data architecture](../3_information/3_data-architecture.md) for the
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
