---
sidebar_position: 1
---

# Getting started

Let's discover **Corgi in less than 10 minutes**.

![Corgi logo](/img/corgi.png)

Send someone your project yml file, init and run it in minutes.

No more long meetings, explanations of how to run new project with multiple
microservices and configs. Just send corgi-compose.yml file to your team and
corgi will do the rest.

Auto git cloning, db seeding, concurrent running and much more.

While in services you can create whatever you want, but in db services **for now it supports**:

- [postgres](https://www.postgresql.org), [example](https://github.com/Andriiklymiuk/corgi_examples/tree/main/postgres)
- [mongodb](https://www.mongodb.com), [example](https://github.com/Andriiklymiuk/corgi_examples/blob/main/mongodb/mongodb-go.corgi-compose.yml)
- [rabbitmq](https://www.rabbitmq.com), [example](https://github.com/Andriiklymiuk/corgi_examples/blob/main/rabbitmq/rabbitmq-go-nestjs.corgi-compose.yml)
- [aws sqs](https://docs.localstack.cloud/user-guide/aws/sqs/), [example](https://github.com/Andriiklymiuk/corgi_examples/blob/main/aws_sqs/aws_sqs_postgres_go_deno.corgi-compose.yml)
- [redis](https://redis.io), [example](https://github.com/Andriiklymiuk/corgi_examples/blob/main/redis/redis-bun-expo.corgi-compose.yml)
- [redis-server](https://redis.io)
- [mysql](https://www.mysql.com)
- [mariadb](https://mariadb.org)
- [dynamodb](https://aws.amazon.com/dynamodb/)
- [kafka](https://kafka.apache.org)
- [mssql](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- [cassandra](https://cassandra.apache.org/_/index.html)
- [cockroachDb](https://www.cockroachlabs.com)
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

Then in any project that has a `corgi-compose.yml`, Claude will recognize it and use `corgi run` / `corgi doctor` / `corgi status` instead of inventing its own commands. A `/corgi-new` slash command scaffolds a fresh `corgi-compose.yml` from a short conversation.

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
