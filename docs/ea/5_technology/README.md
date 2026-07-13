# Technology Layer

_[← EA home](../README.md)_

The runtimes, tooling and infrastructure that the [application
layer](../4_application/README.md) executes on.

## Analysis order

Files are numbered in the order they are analyzed: first _which technology
services exist and what provides them_, then _how the built artifacts reach
their runtime nodes_.

| #   | Document                                               | Elements                                                         | Question it answers                      |
| --- | ------------------------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------- |
| 1   | [1_technology-services.md](./1_technology-services.md) | Technology Services and the nodes/system software providing them | What infrastructure services are used?   |
| 2   | [2_deployment.md](./2_deployment.md)                   | Nodes, Artifacts, and the CI/CD deployment pipeline              | How does the build get to where it runs? |

## Layer view

```mermaid
flowchart TB
  browser["«Node»<br>Visitor's browser<br>(Canvas2D, WebGL, localStorage)"]:::technology
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
