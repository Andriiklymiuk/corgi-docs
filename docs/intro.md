---
sidebar_position: 1
---

# Getting started

Let's discover **Corgi in less than 10 minutes**.

![Corgi logo](/img/corgi.png)

corgi is how you run your project locally — every day, with one command. You
describe your stack once in a `corgi-compose.yml`, and `corgi run` brings the
whole thing up: repos cloned, databases seeded, `.env` files written, every
service started. It even starts Docker for you, so the infra just happens.

Onboarding comes free: hand a teammate the same file and they go from nothing to
a running stack in minutes — no setup call, no "works on my machine". And because
corgi never blocks on a prompt and speaks plain JSON, an AI agent or CI job can
drive it just like you do.

## What corgi does for you

- **Your repos** — clones each service from its Git URL, pulls them all at once,
  forks them, or runs one on a branch worktree without disturbing your checkout.
- **Your databases** — 40+ drivers started in Docker and seeded from a dump or
  remote DB; native shells with credentials filled in (`corgi db shell`);
  LocalStack and Supabase stacks from the same file.
- **Your services** — everything starts together, in the right order, with env
  vars wired between them; `Ctrl-C` cleans up. Run it detached with `corgi run -d`.
- **The fiddly bits** — `corgi doctor` preflight, live `corgi status -w` health,
  public HTTPS tunnels, saved logs, and desktop crash notifications.
- **Made for AI agents** — stable JSON and exit codes, an MCP server
  (`corgi mcp`), and a Claude Code plugin that ships tickets as draft PRs
  (`/corgi:stories`) and reviews them (`/corgi:review`).

## In your day-to-day

corgi isn't a one-time setup tool — it's how you run the project, in whatever
shape the day calls for:

- `corgi run` — the whole stack, one command (and it starts Docker for you).
- `corgi db -u` — just the databases, when you run a service from your IDE.
- `corgi run --tier staging --services web` — run only the frontend, pointed at
  staging. Declare env tiers once, switch with a flag.
- New project? Write a `corgi-compose.yml` first thing — `corgi create` or
  `/corgi-new` — so "how do I run this?" has a permanent answer.
- `/corgi:stories` — let Claude plan a feature across your services, back to
  front, and open a draft PR for each.

While in services you can create whatever you want, but in db services **for now it supports**:

- [postgres](https://www.postgresql.org), [example](https://github.com/Andriiklymiuk/corgi_examples/tree/main/postgres)
- [mongodb](https://www.mongodb.com), [example](https://github.com/Andriiklymiuk/corgi_examples/blob/main/mongodb/mongodb-go.corgi-compose.yml)
- [rabbitmq](https://www.rabbitmq.com), [example](https://github.com/Andriiklymiuk/corgi_examples/blob/main/rabbitmq/rabbitmq-go-nestjs.corgi-compose.yml)
- [sqs](https://docs.localstack.cloud/user-guide/aws/sqs/) — local AWS SQS, [example](https://github.com/Andriiklymiuk/corgi_examples/blob/main/aws_sqs/aws_sqs_postgres_go_deno.corgi-compose.yml)
- [s3](https://docs.localstack.cloud/user-guide/aws/s3/) — local AWS S3 buckets
- [redis](https://redis.io), [example](https://github.com/Andriiklymiuk/corgi_examples/blob/main/redis/redis-bun-expo.corgi-compose.yml)
- [redis-server](https://redis.io)
- [mysql](https://www.mysql.com)
- [mariadb](https://mariadb.org)
- [dynamodb](https://aws.amazon.com/dynamodb/)
- [kafka](https://kafka.apache.org)
- [mssql](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- [cassandra](https://cassandra.apache.org/_/index.html)
- [cockroach](https://www.cockroachlabs.com)
- [clickhouse](https://clickhouse.com)
- [scylla](https://www.scylladb.com)
- [keydb](https://docs.keydb.dev)
- [influxdb](https://www.influxdata.com)
- [surrealdb](https://surrealdb.com)
- [neo4j](https://neo4j.com)
- [arangodb](https://arangodb.com)
- [elasticsearch](https://www.elastic.co/elasticsearch#)
- [timescaledb](https://www.timescale.com)
- [couchdb](https://couchdb.apache.org)
- [dgraph](https://dgraph.io)
- [meilisearch](https://www.meilisearch.com)
- [faunadb](https://fauna.com)
- [yugabytedb](https://www.yugabyte.com)
- [skytable](https://skytable.io)
- [dragonfly](https://www.dragonflydb.io)
- [redict](https://redict.io)
- [valkey](https://github.com/valkey-io/valkey)
- [postgis](https://postgis.net)
- [pgvector](https://github.com/pgvector/pgvector) — postgres + `pgvector` extension. Uses prefix `DB_`, same as plain `postgres`
- [localstack](https://docs.localstack.cloud/) — single container for multiple AWS services (sqs, s3, …), with `queues` / `buckets` auto-created from config

## Preflight & healthcheck

- `corgi doctor` (alias: `check`) — before `corgi run`: verifies every tool in `required:`, Docker is up, and every port in `db_services.*.port` / `services.*.port` is free (lists the offending process if not)
- `corgi status` (aliases: `health`, `healthcheck`) — after `corgi run`: TCP-probes every declared port. If a service sets `healthCheck: /some/path`, corgi does an HTTP probe and accepts any non-5xx response as healthy. The `localstack` driver defaults to `GET /_localstack/health`.

## Install

After install, `corgi` is available globally — run it from any folder.

### macOS / Linux — [Homebrew](https://brew.sh)

```bash
brew install andriiklymiuk/homebrew-tools/corgi
```

### macOS / Linux — install script

No Homebrew? One-liner that picks the right OS/arch binary from GitHub releases:

```bash
curl -fsSL https://raw.githubusercontent.com/Andriiklymiuk/corgi/main/install.sh | sh
```

Installs to `/usr/local/bin` if writable, otherwise `~/.local/bin` (auto-added to PATH for zsh/bash/fish).

Useful overrides:

- `CORGI_VERSION=1.10.0` — pin a version
- `CORGI_INSTALL_DIR=$HOME/bin` — force a directory
- `CORGI_NO_MODIFY_PATH=1` — don't touch shell rc files

### Windows — PowerShell

```powershell
irm https://raw.githubusercontent.com/Andriiklymiuk/corgi/main/install.ps1 | iex
```

Installs to `%LOCALAPPDATA%\corgi\bin` and adds it to your user PATH.

### Verify

```bash
corgi -h
```

`corgi update` (alias `corgi upgrade`) detects how you installed and uses the matching method to upgrade.

Try it with expo + hono server example:

```bash
corgi run -t https://github.com/Andriiklymiuk/corgi_examples/blob/main/honoExpoTodo/hono-bun-expo.corgi-compose.yml
```

### Vscode extension

We also recommend installing
[corgi vscode extension](https://marketplace.visualstudio.com/items?itemName=Corgi.corgi)
which has syntax helpers, autocompletion and commonly used commands. You can
check and run corgi showcase examples from extension too.

### Claude Code users

This repo ships a [Claude Code](https://claude.com/claude-code) plugin so an AI agent can author your `corgi-compose.yml`, run corgi, and debug failures accurately.

```
/plugin marketplace add Andriiklymiuk/corgi
/plugin install corgi@corgi
```

Then in any project that has a `corgi-compose.yml`, Claude will recognize it and use `corgi run` / `corgi doctor` / `corgi status` instead of inventing its own commands. Two workflows do the heavy lifting day to day: `/corgi:stories` hands Claude a batch of tracker issues (or a feature description) and it plans the work across your services, branches per service, and opens a **draft** PR for each; `/corgi:review` reviews those PRs/MRs against your repo's standards and posts inline suggestions. Plus `/corgi-new` to scaffold a fresh `corgi-compose.yml` and `/corgi-describe` for a service map. See [AI agents](ai_agents) for the full picture.

## Services creation

Corgi has several concepts to understand:

- db_services - database configs to use when doing creation/seeding/etc
- services - project folders to use for corgi. Can be server, app, anything you
  can imagine
- required - programs needed for running your project successfully
  (node,yarn,go,whatever you want). They are checked on init

These items are added to corgi-compose.yml file to create services, db services
and check for required software.

Examples of corgi-compose.yml files are in
[examples repo](https://github.com/Andriiklymiuk/corgi_examples). You can also
check what should be in corgi-compose.yml by running `corgi docs`. It will print
out all possible items in corgi .yml file or you can go to
[corgi compose items doc](corgi_compose_items) to see what the syntax and
possible values of corgi-compose.yml

After creating corgi-compose.yml file, you can run to create db folders, clone
git repos, etc.

```bash
corgi init
```

If you want to just run services and already created db_services:

```bash
corgi run
```

_**Tip**_: there can be as many services as you wish. But create it with
different ports to be able to run in all at the same time, if you want.

You can read of what exactly happens on
[run](why_it_exists#what-happens-on-init) or on
[init](why_it_exists#what-happens-on-init) to better understand corgi logic.

## Good to know

**Prerequisites.** You need `git`, and Docker (only if you declare `db_services`).
Everything else is whatever your project lists under `required:` — `corgi doctor`
checks those, and `corgi doctor --fix` can install them by running the `install:`
commands you put in the file.

**Private repos just work.** corgi clones with plain `git`, so your existing SSH
keys / credential helper are used as-is. No corgi-specific auth to set up.

**Secrets stay local.** corgi writes each service's `.env` (db credentials, ports,
sibling URLs) and gitignores `.env*` + `corgi_services/*` on init, so secrets never
get committed. Put your own keys in a service's env or a tier file like
`env/staging/web.env` — also gitignored.

**When a run fails.** Port busy → `corgi doctor` names the holder, `corgi run
--kill-port` frees it. Missing tool or Docker down → `corgi doctor --fix`. Clone
failed → check your git access to that repo.

**Scope.** corgi is a local inner-loop tool — for running your stack on your own
machine, not staging/production or deploys. A `corgi-compose.yml` runs its
`start`/`beforeStart` commands on your machine, so only run files you trust
(especially `corgi run -t <url>`, which downloads and runs a remote one). `corgi
mcp --http` is unauthenticated unless you expose it via `--tunnel` (which adds a
bearer token), and `corgi tunnel` URLs are public — shut them down when done.

**Low lock-in.** Your services stay ordinary git repos, your databases are standard
Docker (corgi writes a plain `docker-compose.yml` per database under
`corgi_services/db_services/`), and the wiring is just `.env` files. Stop using
corgi and you keep all of it.

## Next steps

- [Run a branch or worktree](branch_and_worktree) — run any service on a git branch
  or external checkout for a single run, no `corgi-compose.yml` edit.
- [AI agents](ai_agents) — drive corgi non-interactively from scripts or an LLM:
  JSON output, stable exit/error codes, detached lifecycle, and the Claude Code plugin.
- [corgi-compose.yml items](corgi_compose_items) — every field you can set.
- [Commands](commands/corgi) — full CLI reference.
