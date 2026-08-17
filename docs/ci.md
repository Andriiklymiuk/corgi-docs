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
corgi doctor                                          # fail in seconds, not 20 minutes in
corgi run --feature "$BRANCH" --detach --wait --wait-timeout 20m
corgi status --json                                   # gate on health
corgi test --e2e                                      # the stack's e2e suite
corgi logs --dump ./ci-logs                           # always, for artifacts
```

`--feature` is what makes this work across repos: pass the branch name once and
every repo that has it joins the run, while the rest stay on their default
checkout. See [Run a branch or worktree](./branch_and_worktree).

### What `corgi doctor` adds in CI

The tool, Docker and port checks run everywhere. On a runner it adds two more,
and stays silent about both on a laptop where they are normal mid-setup states:

- **the job is running inside a container** — the database containers would
  publish to a localhost the services cannot reach, which surfaces as "the api
  can't reach postgres" rather than as a runner problem
- **a `copyEnvFromFilePath` that is not on the runner** — those files are almost
  always gitignored, and corgi otherwise falls back to a committed
  `.env-example` whose placeholder values start the service and then fail at the
  first request, thousands of lines from the cause

## The stack's e2e suite

Each service can carry its own `scripts.test`, run with plain `corgi test`. A
suite that drives several services at once — sign up in the web app, hit the
api, read the confirmation mail out of the local SMTP sink — belongs to the
stack, not to any one repo. Declare it once in `corgi-compose.yml`:

```yml
e2e:
  workdir: ./e2e            # where the suite lives
  install: npm ci           # runs once before the suite
  run: maestro test flows/  # or: npx playwright test · cypress run · ./e2e.sh
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

Not on GitHub or GitLab? `corgi cache paths` prints the same plan anywhere —
newline-separated paths, `--key` for the key, `--json` for the per-ecosystem
groups — so a Buildkite or Jenkins job can build its cache config from it too.

## The GitLab include

The counterpart ships in the corgi repo and is pulled in over HTTPS. In the
repo that holds `corgi-compose.yml`:

```yaml
include:
  - remote: https://raw.githubusercontent.com/Andriiklymiuk/corgi/main/gitlab/corgi.yml
    inputs:
      corgi_version: "1.20.17"
      runner_tags: [my-vm-runner]
  - local: .gitlab/corgi-cache.yml

stack-e2e:
  extends: [.corgi-stack-e2e, .corgi-cache]
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

Pin the remote to a tag once it works — an include is fetched fresh on every
pipeline, so `main` would change under you.

| input | |
|---|---|
| `corgi_version` | Version to install, without the leading `v`. Empty takes the latest release. |
| `working_directory` | Where `corgi-compose.yml` lives, relative to the project root. |
| `branch` | Branch every service repo is checked for. Defaults to `$CI_COMMIT_REF_NAME`. |
| `runner_tags` | Tags selecting the runner. Must resolve to a shell or VM-backed runner. |
| `stage` | Stage the jobs belong to. Defaults to `test`. |
| `wait_timeout` | How long `corgi run` waits for health. Defaults to `20m`. |
| `job_timeout` | Ceiling for the whole job, which also bounds `beforeStart`. Defaults to `45m`. |
| `artifacts_dir` | Where e2e artifacts and dumped logs are collected. Defaults to `ci-artifacts`. |
| `allow_container` | Skip the docker-executor guard. Only when the runner really shares the namespace. |

It defines two job templates. `.corgi-setup` installs corgi from a
checksum-verified release archive and **fails fast when the job is running
inside a container** — the number one reason a GitLab port dies in a way that
looks like "the api cannot reach postgres". `.corgi-stack-e2e` is the whole
cross-repo run: clone at the branch, boot, catch a silent `beforeStart`
failure, gate on `corgi status --json`, run `corgi test --e2e`, and dump logs
and artifacts in an always-executed `after_script`.

### Each service repo calls it

Same shape as GitHub's reusable workflow — one file per participating repo:

```yaml
include:
  - project: your-group/your-workspace-repo
    ref: main
    file: stack-e2e.yml
    inputs:
      branch: $CI_COMMIT_REF_NAME

stack-e2e:
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

`CI_JOB_TOKEN` clones the sibling projects once each one grants the calling
project under **Settings → CI/CD → Job token permissions**; a group access
token works too.

### The cache is generated, not read at runtime

An Actions expression can read the plan mid-run. GitLab's cache config is
static YAML, so corgi renders it instead:

```bash
corgi cache paths --gitlab --out .gitlab/corgi-cache.yml    # once, and after any service change
corgi cache paths --gitlab --check .gitlab/corgi-cache.yml  # in CI: fails when it drifts
```

Commit the result and keep `--check` in the pipeline — a generated file that
nothing verifies is a list that silently stops matching the compose file.

Two GitLab rules shape the output. Caches "can't link to files outside" the
project directory, so `~/.npm` and friends are redirected into
`$CI_PROJECT_DIR/.corgi-cache/` along with the environment variable that puts
them there. And a job holds at most four caches, so past three ecosystems the
tail is merged into one entry.

Keys are branch-scoped with a fallback to the default branch rather than hashed
from lockfiles: corgi clones the service repos *during* the job, so no lockfile
exists yet when GitLab would compute a `key:files`. A warm-but-stale restore is
safe anyway — corgi re-hashes every `cacheKey` and checks the dependency
directory is really present before it skips an install, so the worst case is a
reinstall rather than a service started against packages that are not there.

If the pipeline clones the workspace repo into a subdirectory, generate with
`--path-prefix <dir>`: GitLab resolves every cache path against the project
root and nothing else.

## Flags that matter in CI

| Flag | Why |
|------|-----|
| `corgi init --depth 1` | Shallow clone per service repo. `--feature` fetches any branch it needs afterwards, so nothing is lost. |
| `corgi run --detach --wait` | Boots in the background and blocks until every service is healthy — no `sleep 60` guesswork. |
| `corgi run --wait-timeout <d>` | Bounds the wait so a wedged service fails the job instead of hanging the runner. |
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
