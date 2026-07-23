---
sidebar_position: 8
---

# Run the stack in CI

The same `corgi-compose.yml` that boots your machine boots a CI runner. Nothing
about corgi changes in CI — databases still come up in Docker, services still run
as host processes — but a few pieces exist to make the run non-interactive, cheap,
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
corgi init --depth 1 --feature "$BRANCH"              # clone every repo, shallow
corgi run --feature "$BRANCH" --detach --wait --timeout 20m
corgi status --json                                   # gate on health
corgi test --e2e                                      # the stack's e2e suite
corgi logs --dump ./ci-logs                           # always, for artifacts
```

`--feature` is what makes this work across repos: pass the branch name once and
every repo that has it joins the run, while the rest stay on their default
checkout. See [Run a branch or worktree](./branch_and_worktree).

## The stack's e2e suite

Each service can carry its own `scripts.test`, run with plain `corgi test`. A
suite that drives several services at once — sign up in the web app, hit the
api, read the confirmation mail out of the local SMTP sink — belongs to the
stack, not to any one repo. Declare it once in `corgi-compose.yml`:

```yml
e2e:
  workdir: ./e2e            # where the suite lives
  install: npm ci           # runs once before the suite
  run: npx playwright test
```

`corgi test --e2e` runs it against the already-running stack. It deliberately
starts nothing itself: booting is `corgi run`'s job, and keeping the two apart
means a red run always tells you which half failed — the boot or the tests. The
same two commands work on your laptop (`corgi run -d --wait`, then
`corgi test --e2e`), so the e2e suite isn't a CI-only ritual.

## The GitHub Action

`Andriiklymiuk/corgi@v1` installs corgi and tells `actions/cache` what to keep:

```yaml
- uses: Andriiklymiuk/corgi@v1
  id: corgi

- uses: actions/cache@v4
  with:
    path: ${{ steps.corgi.outputs.cache-paths }}
    key: ${{ steps.corgi.outputs.cache-key }}
```

| input | |
|---|---|
| `version` | corgi version to install, without the leading `v`. Omit for the latest release; pin to keep a workflow reproducible. |
| `working-directory` | Where `corgi-compose.yml` lives. Defaults to the repo root; the cache outputs are derived from it. |

| output | |
|---|---|
| `version` | The corgi version that was installed. |
| `cache-paths` | Newline-separated directories worth caching — pass straight to `actions/cache`'s `path`. |
| `cache-key` | Key that changes whenever any `cacheKey` file changes — pass straight to its `key`. |
| `cache-groups` | The same plan split per ecosystem, as JSON (`{id, key, paths, pathsText}` per group). One `actions/cache` step per group keeps a change to one language's lockfile from evicting every other language's packages. |

The action downloads the release archive for the runner's platform and verifies
it against the published `checksums.txt` before installing, so a tampered or
truncated download fails instead of executing. `@v1` moves with each release;
pin an exact tag (`@v1.20.13`) to bump deliberately.

Not on GitHub? `corgi cache paths` prints the same plan anywhere —
newline-separated paths, `--key` for the key, `--json` for the per-ecosystem
groups — so a GitLab or Buildkite job can build its cache config from it too.

## Flags that matter in CI

| Flag | Why |
|------|-----|
| `corgi init --depth 1` | Shallow clone per service repo. `--feature` fetches any branch it needs afterwards, so nothing is lost. |
| `corgi run --detach --wait` | Boots in the background and blocks until every service is healthy — no `sleep 60` guesswork. |
| `corgi run --timeout <d>` | Bounds the wait so a wedged service fails the job instead of hanging the runner. |
| `corgi run --follow` | With `--detach --wait`: streams every service's log while waiting, so the job output shows what the boot was doing. |
| `corgi status --json` | Machine-readable health for a gate step. |
| `corgi test --e2e` | Runs the compose file's `e2e:` block against the live stack. |
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
  lockfile, then let `corgi cache paths` (or the action's outputs) tell the cache
  what to restore. Both halves of the plan are required: the dependency
  directories are the actual saving, and `corgi_services/.cache/` holds the
  markers that let corgi skip an unchanged step — markers without the
  dependency directory would skip an install that is genuinely needed. Worktrees
  created by `--feature` get their own marker scope, so they never inherit the
  main checkout's.

## Want it written for you?

If you use the [Claude Code plugin](./ai_agents), `/corgi-ci` generates
this whole pipeline for your workspace — GitHub Actions or GitLab CI — and knows
the failure modes that usually eat the first afternoon (health checks that do
work per probe, silent `beforeStart` failures, containerised jobs).
