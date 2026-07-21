---
sidebar_position: 8
---

# Run the stack in CI

The same `corgi-compose.yml` that boots your machine boots a CI runner. Nothing
about corgi changes in CI — databases still come up in Docker, services still run
as host processes — but a few flags exist to make the run non-interactive, cheap,
and diagnosable after the fact.

## Why bother

Testing a service against a deployed environment only proves that service. When a
change spans repos — a schema field, a new event, a template the frontend reads —
each repo's own pipeline is green while the combination is broken. Booting the
whole stack from the branches under review is the only check that sees it.

## What corgi detects on its own

`CI`, `GITHUB_ACTIONS`, `GITLAB_CI`, `CIRCLECI`, `BUILDKITE`, `JENKINS_URL`,
`TEAMCITY_VERSION`, `TRAVIS`, `DRONE`, `BITBUCKET_BUILD_NUMBER` and
`CODEBUILD_BUILD_ID`. When any is set corgi drops spinners and banners, prints
plain parseable output, and never prompts.

## A full-stack job

```bash
corgi init --depth 1                                  # clone every repo, shallow
corgi run --feature "$BRANCH" --detach --wait --timeout 20m
corgi status --json                                   # gate on health
# ... run your e2e suite against the live stack ...
corgi logs --dump ./ci-logs                           # always, for artifacts
```

`--feature` is what makes this work across repos: pass the branch name once and
every repo that has it joins the run, while the rest stay on their default
checkout. See [Run a branch or worktree](./branch_and_worktree).

## Flags that matter in CI

| Flag | Why |
|------|-----|
| `corgi init --depth 1` | Shallow clone per service repo. `--feature` fetches any branch it needs afterwards, so nothing is lost. |
| `corgi run --detach --wait` | Boots in the background and blocks until every service is healthy — no `sleep 60` guesswork. |
| `corgi run --timeout <d>` | Bounds the wait so a wedged service fails the job instead of hanging the runner. |
| `corgi status --json` | Machine-readable health for a gate step. |
| `corgi logs --dump <dir>` | Copies the newest run of every service into one directory to upload as build artifacts. Run it in an always-executed step — the logs matter most when the job failed. |
| `skipInCi` on a required tool | Drops tools only a human needs (a tunnel client, say) from preflight. |

```yaml
required:
  docker:
    why: [runs the databases]
  ngrok:
    why: [public URL for webhooks during local development]
    skipInCi: true
```

## Runner notes

- **Do not run the job inside a container.** Docker-in-Docker stops the runner and
  the database containers from sharing `localhost`, which is what every generated
  connection string assumes. Run the steps on the VM.
- **Disk.** A full stack pulls several GB of images and installs dependencies for
  every service. Hosted runners are often provisioned tighter than that; free
  space up front rather than debugging a confusing mid-run failure.
- **Caching.** Give each `beforeStart` install step a `cacheKey` pointing at its
  lockfile, then restore the dependency directories *and*
  `corgi_services/.cache/` between runs — corgi skips any step whose key is
  unchanged. Both halves are required: markers without the dependency directory
  would skip an install that is genuinely needed. Worktrees created by
  `--feature` get their own marker scope, so they never inherit the main
  checkout's.
