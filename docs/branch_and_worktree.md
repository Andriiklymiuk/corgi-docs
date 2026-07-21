---
sidebar_position: 4
---

# Run a branch or worktree

Point any service at a git branch or an external checkout **for a single run** —
without editing `path:` in `corgi-compose.yml`. The flags are per-service and
repeatable; any service you don't flag runs from its compose `path:` as usual.
They work on `corgi run`, `corgi exec`, and `corgi test`, and all three repoint the
service's working dir — so its env generation, `beforeStart`/`afterStart`, and
process all run there.

## The flags

| Flag | What it does | Destructive? |
|------|--------------|--------------|
| `--service-branch <svc>=<branch>` | Runs the service from a **reused git worktree** under `corgi_services/.worktrees/<svc>-<branch>` | No — main checkout untouched |
| `--service-dir <svc>=<path>` | Runs the service from an existing directory you already have | No |
| `--service-checkout <svc>=<branch>` | `git checkout <branch>` **in place** in the service's `path:` | Yes — refuses on a dirty tree, leaves the repo on that branch |
| `--feature <branch>` | Runs **every** service whose repo has that branch from a worktree for it; the rest stay on their current checkout | No — main checkouts untouched |

A service may appear in only one of the first three at a time. `--feature` is
fleet-wide and yields to any of them for a service they name.

## Examples

```bash
# run a feature branch of api; the rest of the stack runs from compose path:
corgi run --service-branch api=feature/login

# mix: api on a branch, web from an explicit dir, others from compose path:
corgi run --detach \
  --service-branch api=feature/login \
  --service-dir web=/tmp/wt/web

# switch the actual checkout in place (clean tree only)
corgi run --service-checkout api=hotfix/x

# test or run a one-off command on a branch
corgi test --service api --service-branch api=feature/login
corgi exec api --service-branch api=feature/login --ensure-deps -- npm run migrate
```

## One change, several repos: `--feature`

A change that spans services usually lands as one branch name in each repo it
touches. `--feature` takes that name once and applies it everywhere it exists:

```bash
corgi run --feature ABC-123-checkout-flow --detach --wait
```

For every service corgi asks its repo whether the branch exists — as a local head
or on `origin`. Services that have it run from a worktree for it; services that
don't stay on whatever they are checked out at. Nothing is checked out in place,
and a missing branch is never an error — that asymmetry is the point, since a
feature rarely touches the whole stack.

A remote-only branch is fetched first, so a fresh (or `--depth 1`) clone works
without any prior `git fetch`. Per-service flags win: give `--service-branch
api=other` alongside `--feature ABC-123` and api uses `other` while everything
else still follows the feature branch.

This is what makes a full-stack CI job possible: check out the repos, pass the
PR's branch name once, and every repo that carries the change joins the run.

## How `--service-branch` reuse works

The worktree path is deterministic per `(service, branch)`. On each run corgi
prunes stale entries and then:

- **reuses** the worktree if it already exists and is healthy — keeping installed
  deps (`node_modules`, etc.) and any uncommitted work in it;
- **creates** it (`git worktree add`) only when missing or broken.

So re-running the same branch is fast and never throws away state. The branch must
exist (local or remote). Your service's main checkout is never touched.

## Managing worktrees

Worktrees accumulate one per branch under `corgi_services/.worktrees/`:

```bash
corgi worktree list     # print every corgi-created worktree
corgi worktree prune    # git worktree remove them all (also done by corgi clean)
```

## When to use which

- **Reviewing a PR branch** or trying someone's change → `--service-branch` (safe,
  your checkout stays put).
- **Comparing two branches side by side** → run each in its own stack on different
  ports; each is isolated in its own worktree.
- **You already have a checkout/worktree** somewhere → `--service-dir`.
- **You want the repo genuinely switched** to the branch → `--service-checkout`.
- **AI agents** → one agent can run an isolated branch while another runs `main`,
  with no collisions. See [AI agents](./ai_agents).
