---
sidebar_position: 7
---

# AI agents

corgi is designed to be driven by AI agents and scripts, not only typed by hand.
It detects non-interactive environments and never hangs on a prompt, speaks pure
JSON when asked, and exposes stable exit and error codes an agent can branch on —
so an LLM can run your stack, read real status, and fix the right thing.

## Non-interactive mode

corgi auto-detects when it must not prompt and either skips the prompt or exits
with a clear error (exit code `2`) instead of hanging. It triggers on:

- a CI env var (`CI=true`, …);
- an agent env var: `CLAUDECODE`, `CLAUDE_CODE`, `ANTHROPIC_AGENT`;
- no TTY on stdin **or** stdout (piped / redirected).

Force prompts back on with the global `--interactive` flag.

## JSON output

The global `--json` flag makes stdout a pure machine-readable payload; human and
log lines go to stderr. Errors have a stable shape:

```json
{ "error": { "code": "E_PORT_CONFLICT", "message": "..." } }
```

The `code` is a stable string to branch on. Commands with pure-JSON stdout include
`status`, `doctor`, `list`, `config`, `ps`, `open`, `logs`, `restart`, and
`db shell -e`.

## Detached lifecycle

`corgi run --detach` (`-d`) starts every service as a detached process group that
survives corgi exiting, writes `corgi_services/.state.json`, and returns
immediately. Inspect and control it without a daemon:

```bash
corgi run --detach --json        # start, print run-state, return
corgi status --ready --timeout 60s   # block until everything is healthy
corgi ps --json                  # running / crashed / stopped from state
corgi stop                       # stop everything from state
```

## Run a branch without touching the repo

Agents often need to run a specific branch — a PR under review, or their own work
— without disturbing the developer's checkout. Use `--service-branch`, which runs
the service from an isolated, reused git worktree:

```bash
corgi run --detach --service-branch api=feature/login
```

One agent can run a branch while another runs `main`, each isolated. Full details:
[Run a branch or worktree](./branch_and_worktree).

## Safe agent recipe

```bash
corgi doctor --json || exit 1                 # ports free, docker up, tools present
corgi run --detach --json                     # launch, returns immediately
corgi status --ready --timeout 90s || exit 1  # block until healthy
corgi ps --json                               # inspect real status
# ... do work ...
corgi stop
```

## Claude Code plugin

This project ships a [Claude Code](https://claude.com/claude-code) plugin so Claude
can author your `corgi-compose.yml`, run corgi, and debug failures accurately:

```
/plugin marketplace add Andriiklymiuk/corgi
/plugin install corgi@corgi
```

It adds:

- `/corgi-run` — boot the stack (or a slice) detached and wait until healthy; tunnel,
  logs, remote-backend, emulator-host, and per-service branch/worktree
  (`--service-branch`/`--service-dir`) modes included.
- `/corgi-debug` — diagnose a stack local-first (`ps`/`status`/`doctor`/`logs`), or
  pull runtime/deployed logs for a bug from your stack's own provider (Coralogix,
  CloudWatch/ECS, Datadog… — auto-detected from your README), on demand.
- `/corgi-suggest` — ranked, evidence-backed product + engineering improvements, each
  tied to a measurable outcome; specs the one you pick and can open a tracker story.
- `corgi:stories` — turn tracker issues or a feature description into spec'd, tested,
  reviewed draft PRs (each service in its own worktree).
- `corgi:review` — review existing GitHub/GitLab PRs/MRs against your repo's standards
  and the linked ticket.
- `/corgi-new` (scaffold a compose file) and `/corgi-describe` (service map + Mermaid
  diagram).
