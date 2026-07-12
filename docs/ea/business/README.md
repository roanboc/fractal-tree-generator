# Business Layer

_[← EA home](../README.md)_

Who interacts with Fractal Tree Studio, the services it offers them, the
processes those services run through, and the business objects they handle.

| Document                                                       | Elements                  |
| -------------------------------------------------------------- | ------------------------- |
| [business-actors-and-roles.md](./business-actors-and-roles.md) | Business Actors and Roles |
| [business-services.md](./business-services.md)                 | Business Services         |
| [business-processes.md](./business-processes.md)               | Business Processes        |
| [business-objects.md](./business-objects.md)                   | Business Objects          |

## Layer view

```mermaid
flowchart TB
  visitor["«Business Actor»<br>Visitor"]:::business
  learner["«Business Role»<br>Learner"]:::business
  creator["«Business Role»<br>Creator"]:::business

  inspire["«Business Service»<br>Inspiration"]:::business
  educate["«Business Service»<br>Fractal education"]:::business
  tree["«Business Service»<br>Tree generation"]:::business
  snow["«Business Service»<br>Snowflake crafting"]:::business
  author["«Business Service»<br>Custom-rule authoring"]:::business
  export["«Business Service»<br>Artwork export"]:::business
  l10n["«Business Service»<br>Localized experience"]:::business

  journey["«Business Process»<br>Guided journey"]:::business
  artwork["«Business Object»<br>Artwork (PNG)"]:::business

  visitor -->|assigned to| learner
  visitor -->|assigned to| creator
  learner -->|served by| inspire
  learner -->|served by| educate
  creator -->|served by| tree
  creator -->|served by| snow
  creator -->|served by| author
  creator -->|served by| export
  visitor -->|served by| l10n

  journey -->|realizes| inspire
  journey -->|realizes| educate
  journey -->|realizes| tree
  journey -->|realizes| snow
  journey -->|realizes| author
  export -->|accesses| artwork

  classDef business fill:#fffbb5,stroke:#b8a200,color:#333
```

Every business service is realized by application services — the mapping is in
[application/application-services.md](../application/application-services.md).
