# Strategy & Motivation Layer

_[← EA home](../README.md)_

The top-down business context: who has a stake in Fractal Tree Studio, why it
exists, which capabilities it needs, and the value stream it delivers. This
layer motivates everything below it — each capability is realized by business
services in the [business layer](../business/README.md).

| Document                                                         | Elements                                                        |
| ---------------------------------------------------------------- | --------------------------------------------------------------- |
| [motivation.md](./motivation.md)                                 | Stakeholders, Drivers, Assessments, Goals, Outcomes, Principles |
| [capabilities-and-resources.md](./capabilities-and-resources.md) | Capabilities, Resources, Courses of Action                      |
| [value-stream.md](./value-stream.md)                             | The Wonder → Author value stream and its chapter mapping        |

## Layer view

```mermaid
flowchart TB
  learner["«Stakeholder»<br>Curious learner"]:::motivation
  driver["«Driver»<br>Math feels abstract<br>and unapproachable"]:::motivation
  goal["«Goal»<br>Take anyone from wonder<br>to authoring fractals"]:::motivation

  vs["«Value Stream»<br>Wonder → Understand → Create<br>→ Craft → Author"]:::strategy
  cap["«Capability»<br>Interactive fractal education<br>& generative art"]:::strategy
  res["«Resource»<br>Shared TypeScript core<br>(two fractal engines)"]:::strategy

  learner -->|concerned with| driver
  driver -->|influences| goal
  goal -->|realized by| vs
  vs -->|requires| cap
  cap -->|uses| res

  classDef motivation fill:#e6d6f5,stroke:#7e57c2,color:#333
  classDef strategy fill:#f5deaa,stroke:#c8a24a,color:#333
```
