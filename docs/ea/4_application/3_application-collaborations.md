# Application Collaborations

_[← Application layer](./README.md)_

**ArchiMate elements:** Application Collaboration, Application Interaction.
Key runtime sequences that show components cooperating to realize an
application service.

## C1 — Generate (tree, snowflake, or custom fractal)

The same serialize-and-run pattern is shared by all three generator pages via
`serialRunner.ts`, so it is documented once.

```mermaid
sequenceDiagram
  participant UI as Panel (ControlsView /<br>SnowflakeControls / options)
  participant Page as Page entry (main.ts /<br>snowflake.ts / create.ts)
  participant Runner as serialRunner
  participant Engine as FractalService /<br>TurtleFractalService
  participant Renderer as WebRendererService

  UI->>Page: onChange / onGenerate
  Page->>Runner: run(params)
  alt a run is already in flight
    Runner->>Runner: queue latest params, return
  else idle
    Runner->>Engine: generate(params) / run(program, options)
    Engine->>Renderer: initialize(canvasConfig)
    loop each segment
      Engine->>Renderer: drawBranch(x, y, len, angle, width, color, strokeMs)
      Renderer-->>Engine: await stroke animation
      Engine->>Engine: speedControl.wait()
    end
    Engine-->>Runner: RenderResult / TurtleRenderResult
    opt another run was queued meanwhile
      Runner->>Engine: run again with latest params
    end
  end
```

Realizes: Tree generation, Snowflake crafting, Custom-rule authoring
(drawing step). Contract: `IFractalService.generate` /
`ITurtleFractalService.run` in [interface contracts](../4_application/5_interface-contracts.md).

The 3D tree page (`tree3d.ts`) deliberately does **not** use the serial
runner: `Tree3DService.generate` builds the whole `Segment3D` scene
synchronously and `presentScene` replaces the displayed scene atomically,
so overlapping calls cannot interleave strokes the way the per-segment 2D
engines can. Camera motion (orbit/zoom/spin) happens entirely inside
`WebGLTreeRendererService` without re-entering the core.

## C2 — Two-way formula sync (chapter 5 authoring loop)

```mermaid
sequenceDiagram
  participant Text as FormulaBox (textarea)
  participant Formula as formula.ts
  participant State as create.ts (AST owner)
  participant Builder as RuleBuilderView
  participant Runner as serialRunner → TurtleFractalService

  alt visitor edits text
    Text->>Text: debounce 300ms
    Text->>Formula: parseFormula(source)
    alt parses
      Formula-->>State: TurtleProgram
      State->>Builder: render()
      State->>Runner: run(program)
    else fails
      Formula-->>Text: FormulaError[] (position, code)
      Text->>Text: show inline error, keep last valid canvas
    end
  else visitor edits a builder row
    Builder->>State: mutate AST in place
    State->>Formula: serializeFormula(ast)
    Formula-->>Text: setText(canonical) — skipped if textarea focused
    State->>Formula: validateProgram(ast)
    alt valid
      State->>Runner: run(program)
    else invalid
      Text->>Text: show error, do not redraw
    end
  end
```

Realizes: Custom-rule authoring. Invariant:
`parseFormula(serializeFormula(p)) ≡ p` (unit-tested), which is what prevents
the two representations from oscillating.

## C3 — Language switch

```mermaid
sequenceDiagram
  participant Btn as Header lang button
  participant I18n as i18n.ts
  participant Chrome as chrome.ts
  participant Page as Active page module

  Btn->>I18n: setLang('es')
  I18n->>I18n: persist to localStorage, update URL
  I18n->>I18n: translatePage() — data-i18n / data-i18n-html
  I18n-->>Chrome: dispatch ftree:langchange
  Chrome->>Chrome: re-render header/badge/pager
  I18n-->>Page: ftree:langchange
  Page->>Page: rerender dynamic panels<br>(ControlsView / SnowflakeControls / create.ts panel+builder)
```

Realizes: Localized experience. Every dynamically-built panel listens for
`ftree:langchange` so no page requires a reload to switch language.
