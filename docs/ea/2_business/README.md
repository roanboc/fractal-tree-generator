# Business Layer

_[← EA home](../README.md)_

Who interacts with Fractal Tree Studio, the services it offers them, the
processes those services run through, and the business objects they handle.

## Analysis order

Files are numbered in the order they are analyzed: identify _who_ first,
then _what they are offered_, then _how it is delivered_, then _what is
handled_, and finally the domain vocabulary and rules that constrain all of
it.

| #   | Document                                                           | Elements                                           | Question it answers                              |
| --- | ------------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------ |
| 1   | [1_business-actors-and-roles.md](./1_business-actors-and-roles.md) | Business Actors and Roles                          | Who interacts with the studio?                   |
| 2   | [2_business-services.md](./2_business-services.md)                 | Business Services                                  | What is offered to them?                         |
| 3   | [3_business-processes.md](./3_business-processes.md)               | Business Processes                                 | How are those services delivered?                |
| 4   | [4_business-objects.md](./4_business-objects.md)                   | Business Objects                                   | What things do the processes handle?             |
| 5   | [5_domain-context-and-rules.md](./5_domain-context-and-rules.md)   | Problem statement, system context, glossary, rules | What vocabulary and constraints bind everything? |

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
[application/1_application-services.md](../4_application/1_application-services.md).
