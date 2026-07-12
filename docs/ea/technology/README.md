# Technology Layer

_[← EA home](../README.md)_

The runtimes, tooling and infrastructure that the [application
layer](../application/README.md) executes on.

| Document                                           | Elements                                                         |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| [technology-services.md](./technology-services.md) | Technology Services and the nodes/system software providing them |
| [deployment.md](./deployment.md)                   | Nodes, Artifacts, and the CI/CD deployment pipeline              |

## Layer view

```mermaid
flowchart TB
  browser["«Node»<br>Visitor's browser<br>(Canvas2D, localStorage)"]:::technology
  pages["«Technology Service»<br>GitHub Pages<br>(static hosting)"]:::technology
  actions["«Technology Service»<br>GitHub Actions<br>(CI + deploy)"]:::technology
  devnode["«Node»<br>Developer/CLI machine<br>(Node.js + Cairo)"]:::technology
  vite["«System Software»<br>Vite build"]:::technology

  browser -->|requests| pages
  actions -->|builds with| vite
  actions -->|publishes to| pages
  devnode -->|runs| vite
  devnode -->|runs| actions

  classDef technology fill:#c9e7b7,stroke:#558b2f,color:#333
```
