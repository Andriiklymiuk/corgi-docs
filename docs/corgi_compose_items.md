---
sidebar_position: 3
---

# corgi-compose.yml reference

![Links meme](/img/links_meme.jpg)

Every field you can set in a `corgi-compose.yml`. Working examples live in the
[examples repo](https://github.com/Andriiklymiuk/corgi_examples).

:::tip Source of truth
This page is a friendly reference. The authoritative, always-current schema is
built into the binary:

```bash
corgi docs --json-schema > corgi-compose.schema.json   # machine-readable JSON Schema
corgi docs                                              # human-readable field list
```

Add the schema to the top of your file for editor autocomplete + validation:

```yaml
# yaml-language-server: $schema=./corgi-compose.schema.json
```

The [VS Code extension](https://marketplace.visualstudio.com/items?itemName=corgi.corgi)
wires this up automatically.
:::

## Top-level keys

```yaml
name:         string   # project name
description:  string   # free-text description
useDocker:    bool     # run services via Docker instead of natively
useAwsVpn:    bool     # initialize AWS VPN before run
init:         [string] # shell commands run on `corgi init`
beforeStart:  [string] # shell commands run before any service starts
afterStart:   [string] # shell commands run on shutdown (Ctrl-C / SIGTERM)
db_services:  { ... }  # databases & infra (see below)
services:     { ... }  # your apps/servers (see below)
required:     { ... }  # tools that must be installed (see below)
envTiers:     { ... }  # optional named env bundles, picked with --tier
```

## `services.<name>`

Your apps and servers. corgi clones them, generates a `.env`, and runs them.

| Field | Type | Description |
| --- | --- | --- |
| `path` | `string` | Path to the service repo (default: folder of `corgi-compose.yml`). |
| `cloneFrom` | `string` | Git URL; cloned to `path` if missing. |
| `branch` | `string` | Branch to check out on clone (default: repo default). |
| `port` | `int` | Service port; written to `.env`. |
| `portAlias` | `string` | Env var name for the port (default `PORT`). |
| `manualRun` | `bool` | Skip on `corgi run` unless `--services <name>` is passed. |
| `ignore_env` | `bool` | Don't generate/modify the service's `.env`. |
| `envPath` | `string` | Where the `.env` lives in the repo (default `.env`). |
| `copyEnvFromFilePath` | `string` | Template `.env` to copy in; falls back to repo `.env-example` / `.env.example`. |
| `envPlaceholdersToCheck` | `[string]` | Tokens that mark unfilled values; corgi warns (doesn't fail) if any survive. |
| `localhostNameInEnv` | `string` | Host written to `.env` (default `localhost`; becomes `host.docker.internal` under Docker). |
| `environment` | `[string]` | Extra `KEY=value` env vars. Supports `${OWN_VAR}` and `${producer.VAR}` cross-service refs. |
| `autoSourceEnv` | `bool` | Default `true`. `false` = don't auto-source `.env` into commands (avoid leaking secrets to subprocesses). |
| `healthCheck` | `string` | HTTP path `corgi status` probes (e.g. `/health`); any non-5xx = healthy. |
| `interactiveInput` | `bool` | Keep stdin open for `start` commands. |
| `depends_on_db` | `[]` | DB credentials injected into `.env` (see below). |
| `depends_on_services` | `[]` | Other services' URLs injected into `.env` (see below). |
| `exports` | `[string]` | Vars exposed to dependents: `"NAME"` re-exports own env, `"NAME=value"` an inline literal. |
| `runner` | `{ name }` | `docker` or a custom runner. |
| `beforeStart` | `[string\|object]` | Run before `start`. Object form `{ run, cacheKey: [files] }` skips the step when those files' hash is unchanged (`--no-cache` forces it). |
| `start` | `[string]` | Main, blocking command(s) — run in parallel across services. |
| `afterStart` | `[string]` | Run on exit (also on single-service stop/restart). |
| `restartPolicy` | `{ mode, maxRetries, backoffSeconds }` | Auto-heal a detached service that crashes at startup. `mode: on-failure \| never`. |
| `openOnReady` | `bool\|object` | Open the URL when `healthCheck` passes (needs `corgi run --open`). |
| `scripts` | `[]` | Named scripts run via `corgi script -n <name>` / `corgi test`. |
| `tunnel` | `object` | Public HTTPS tunnel config (see below). |

### `depends_on_db` / `depends_on_services`

```yaml
depends_on_db:
  - name: my_postgres        # a db_services entry
    envAlias: SEED           # prefix → SEED_DB_HOST, SEED_DB_USER, … (omit for plain DB_*)
    forceUseEnv: false

depends_on_services:
  - name: api                # another service
    envAlias: API_URL        # env var name for that service's URL
    suffix: /api/v1          # appended to the URL
    scheme: https            # default http
```

### `scripts`

```yaml
scripts:
  - name: test               # corgi script -n test  (or corgi test)
    manualRun: false
    commands:
      - go test ./...
    copyEnvFromFilePath: ./ci.env
```

## `db_services.<name>`

Databases and infra, run as Docker containers. See the examples repo and
`corgi docs` for the full driver list.

| Field | Type | Description |
| --- | --- | --- |
| `driver` | `string` | **Required.** `postgres`, `mysql`, `mongodb`, `redis`, `supabase`, `localstack`, `image`, … |
| `host` | `string` | Default `localhost`; written to `DB_HOST`. |
| `port` | `int` | Host port (`0` = no exposed port). |
| `port2` | `int` | Secondary port (e.g. admin UI for neo4j/dgraph; mailpit web UI). |
| `user` / `password` | `string` | Credentials (`DB_USER` / `DB_PASSWORD`). mssql password ≥ 8 chars. |
| `databaseName` | `string` | DB/schema name (`DB_NAME`). |
| `version` | `string` | Image tag (default `latest`). |
| `manualRun` | `bool` | Skip unless `--dbServices <name>` is passed. |
| `healthCheck` | `string` | HTTP path for `corgi status`. |
| `seedFromFilePath` | `string` | Path to a dump (`.sql`, `.bak`, `.cql`, …) to seed from. |
| `seedFromDbEnvPath` | `string` | Path to a `.env` holding seed-source DB creds. |
| `seedFromDb` | `object` | Inline seed-source creds (`host/port/user/password/databaseName`). |

**Driver-specific** (set under the same entry): `image` / `containerPort` /
`environment` / `volumes` / `command` for the generic `image` driver;
`additional.definitionPath` (rabbitmq); `services` / `queues` / `buckets`
(localstack); `buckets` / `authUsers` / `jwtSecret` / `configTomlPath` /
`dbPort` / `studioPort` / `inbucketPort` (supabase). See
[`corgi docs`](commands/corgi_docs) for the per-driver list.

## `required.<tool>`

Tools that must be present before running. Checked by `corgi doctor`.

```yaml
required:
  go:
    why:
      - To run the Go service locally
    install:
      - brew install go
    checkCmd: go version   # default: <tool> -v
    optional: false        # true → prompt before installing
```

## `services.<name>.tunnel`

```yaml
services:
  api:
    port: 3030
    tunnel:
      provider: cloudflared        # cloudflared (default, free) | ngrok
      hostname: ${API_TUNNEL_HOST} # public URL (required when block present)
      name: ${USER}-api-dev        # cloudflared only: pre-created named tunnel
```

`${VAR}` resolves: shell env → `<service-dir>/.env` → the `copyEnvFromFilePath`
source env. Missing vars are a strict error at `corgi tunnel`.

## `envTiers.<name>`

Named run bundles selected with `corgi run --tier <name>`.

```yaml
envTiers:
  staging:
    dir: env/staging      # per-service lookup: env/staging/<service>.env
    dbServices: none
  prod:
    dir: env/prod
    dbServices: none
    confirm: true         # prompt before running (bypass with --yes)
```

## `${VAR}` interpolation

The whole file is interpolated **before** parsing, so `${VAR}` works in any string
field (ports, passwords, paths, image refs, `environment` entries):

- `${VAR}` — value of `VAR`.
- `${VAR:-default}` — `VAR`, or `default` when unset/empty.
- `$${X}` — literal `${X}` (not expanded).
- Bare `$VAR` is left untouched (safe for shell snippets).
- Dotted `${producer.VAR}` cross-service refs resolve later, from `exports`.

[Main docs](/docs/intro)
