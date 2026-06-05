---
sidebar_position: 2
---

# What is my purpose?

![Purpose](/img/purpose.jpeg)

corgi exists to make running a multi-service project a non-event — something you
do every day with one command instead of a morning of setup.

A modern app is rarely one repo. It's a few services, a database or two, some
infra (a queue, a cache, an S3-alike), env vars wired between all of it, and a
list of tools everyone is supposed to have installed. Standing that up by hand —
or keeping it running — is the same slog whether you just joined the team, picked
up a new laptop, or started a fresh project.

`docker-compose` handles the _containers_. corgi handles everything around them:
it git-clones the service repos, starts and **seeds** the databases in Docker
(using docker-compose under the hood per db), auto-wires the env vars between
services, checks the tools you need, and runs everything together. Your databases
run in containers; your services run as normal processes. One file describes it
all, and the same file is how you run the stack from then on — fully local, or
with part of it pointed at staging.

Here is example, that we will explain, based on
[corgi-compose.yml postgres example](https://github.com/Andriiklymiuk/corgi_examples/blob/main/postgres/postgres-seeded-go-reactnative.corgi-compose.yml)

```yml
db_services:
  postgres_with_data_for_go_reactnative:
    driver: postgres
    databaseName: bestDbName
    user: awesomeUser
    password: themostsecurepasswordyoucanimaging
    port: 5511
    seedFromFilePath: ./users_dump.sql

services:
  reactnative_app_get_user:
    cloneFrom: https://github.com/Andriiklymiuk/reactnative_app_get_user.git
    path: ./reactnative_app_get_user
    depends_on_services:
      - name: go_server_user_data
    beforeStart:
      - yarn install
      - npx pod-install
    start:
      - yarn start
      - yarn ios
    afterStart:
      - yarn ios:simulator:close
  go_server_user_data:
    cloneFrom: https://github.com/Andriiklymiuk/go_server_user_data.git
    path: ./go_server_user_data
    port: 7012
    depends_on_db:
      - name: postgres_with_data_for_go_reactnative
        envAlias: none
    start:
      - go run .

required:
  go:
    why:
      - To launch locally go service manually
      - You need to install it yourself brew install go
    checkCmd: go version
  yarn:
    why:
      - To build and launch some of the repos locally with yarn
    install:
      - brew install yarn
    checkCmd: yarn -v
  node:
    why:
      - To build and launch some of the repos locally with npm
    install:
      - brew install node
    checkCmd: node -v
  docker:
    why:
      - To launch databases
      - You need to install it yourself from https://docs.docker.com/desktop/install/mac-install/
    checkCmd: docker -v
```

## What happens on init

1. It adds `corgi_services/*`, `.env*`, and any cloned service directories to your
   project's `.gitignore` — so generated env files (including secrets) and corgi's
   working state never get committed. Your `corgi-compose.yml` itself is **not**
   ignored; that's the file you commit and share.
2. Creates folder with db helpers files in in `corgi_services/db_services`
   folder. These files are created, so that you can run db_services manually, if
   you want.
3. If the path provided doesn't exist and cloneFrom is provided, than it will
   run git clone with provided url. So, for example, you provide path to
   service: `./myWoofServices/corgiserver`, than it will run git clone in
   `./myWoofServices/` folder. **Bear in mind**, that git clone should create
   `corgiserver` folder to correctly work.

## What happens on run

If you run `corgi run` it will:

1. Create folder with db helpers files in in `corgi_services/db_services`
   folder. These files are created, so that you can run db_services manually, if
   you want.
2. If there are any db_services, than it will auto launch docker (if not
   launched)
3. If there is --seed flag added, it will get db dump from `seedFromFilePath`
   file dump or from `seedFromDb` or database and populate database
4. Start databases in docker (docker up)
5. Check `depends_on_db` part in each service and it will add env variables
   (DB_HOST, DB_USER, DB_NAME, DB_PORT ,DB_PASSWORD) for db in the .env file in
   service path
6. Check `depends_on_service` part in each service and it will add env variables
   for service (server/app, etc) in the .env file in service path in the form of
   `http://localhost:POST_IN_DEPENDENT_SERVICE` (in corgiApp it will add
   `http://localhost:8965`)
7. Runs each service **concurrently** (in parallel)

- Runs scripts in `beforeStart` of service
- Runs scripts in `start` of service **concurrently** (in parallel)

8. If you run `Ctrl-C` in terminal, it will:

- terminate all services and their scripts
- stop all databases
- runs all `afterStart` commands

## Beyond a plain run

A few commands round out the day-to-day loop:

- **`corgi doctor`** — preflight before `run`: checks every tool in `required:`,
  that Docker is up, and that all ports are free. `--fix` auto-remediates.
- **`corgi status`** (`-w` watch, `-r` ready) — probes each service's port (and
  `healthCheck:` path) and reports healthy / unhealthy.
- **`corgi run --detach`** — start everything in the background, write
  `corgi_services/.state.json`, and return immediately; manage it later with
  `corgi ps` / `corgi stop`.
- **`corgi run --service-branch api=feature/x`** — run a single service on a git
  branch in an isolated worktree, without touching your checkout. See
  [Run a branch or worktree](branch_and_worktree).

Scripts, JSON output, and the full flag set are in the
[command reference](commands/corgi) and the [AI agents](ai_agents) guide.

## Why GO?

It is written in GOLANG in order to be: fast and simple, without ton of
dependencies. Language isn't that different from javascript of typescript, so it
can be used by everyone, can be learnt in one day.

This project is also a proof of concept, that Go is simple, fast and easy to be
written, so we can use it to create microservices and write automation.

Pros of using go

- easy to use and fast to write production level code
- most things can be done with standard lib itself
- small (if we remove all fancy staff, then the binary will be around 1mb more
  or less)
- makes you think about error handling during coding itself
- formatting and testing out of the box
- concurrent from the box (parallel simply speaking) (socket will be cool to
  write in go)

**In short**: install go and you are good to go

_**P.S.**_: go is not needed to use cli
