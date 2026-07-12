---
name: pr-description
description: Use when creating or updating a pull request in this repo. The PR body must follow .github/pull_request_template.md and cover every change on the branch (diff against main) — never just the latest commit.
---

# Writing a PR description

## Cover the whole branch, always

Before writing (or rewriting) the body, gather what the branch actually
contains — the PR is reviewed and merged as a unit, so its description must
account for all of it:

```bash
git log --oneline main..HEAD      # every commit on the branch
git diff main...HEAD --stat       # every file the branch touches
```

If the branch carries more than one initiative, say so and link each scope
document; the Changes section then gets one subsection per initiative.

## Follow the template

Fill every section of `.github/pull_request_template.md`:

- **Summary** — what the branch delivers, 2–4 sentences.
- **Scope document** — link the `docs/scope/N_*.md` file(s) this branch adds
  or updates. A pure bug fix may state "no scope document" with a reason.
- **EA layers touched** — copy the verdicts from the scope document's
  alignment table; every layer gets one, including explicit "no change".
- **Changes** — grouped by work package/area, covering the full
  `main...HEAD` diff. If a file change isn't explainable here, it either
  needs a mention or doesn't belong on the branch.
- **Verification** — the commands run (lint, typecheck, tests, build) and
  their results, plus manual/end-to-end checks.
- **Out of scope / follow-ups** — mirror the scope document's gap notes.

## Keep it current

When you push more commits to a branch with an open PR, **update the PR
body** so it still describes the whole branch — the description is a living
document until merge, not a snapshot of the first push. Re-run the two git
commands above and reconcile.
