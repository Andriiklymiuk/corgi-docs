---
sidebar_position: 4
---

# Dockerfile services

A service whose repo ships a `Dockerfile` (or its own `docker-compose.yml`)
can run in a container with nothing more than `cloneFrom`:

```yaml
services:
  api:
    cloneFrom: git@example.com:org/api.git # repo has a Dockerfile
    port: 3084
```

`corgi run` clones the repo, sees there are no `start:` scripts, finds the
Dockerfile, builds the image and runs the container — and says so:

```
✨ api: no start scripts — running from Dockerfile
```

## The complexity ladder

Pick the rung that fits each service; they mix freely in one file.

1. **`cloneFrom` only, repo has `docker-compose.yml`** — corgi drives the
   repo's own compose file (`docker-compose.yml` / `.yaml`, `compose.yml` /
   `.yaml`), passing corgi's generated env via `--env-file` so `${VAR}`
   references resolve.
2. **`cloneFrom` only, repo has `Dockerfile`** — corgi generates a compose
   wrapper (ports, env, restart policy) and runs it.
3. **`runner:` fields tune the build** — custom dockerfile path, target,
   build args, volumes, container port, command.
4. **`beforeStart` / `start` scripts** — native mode, exactly as before.
5. **Scripts *and* a Dockerfile** — scripts run by default;
   `corgi run --docker` flips every docker-capable service to containers.

## When does a service run in docker?

In priority order:

1. `runner: docker` declared → always.
2. `corgi run --docker` → every service with a Dockerfile or compose file.
3. No `start:` commands and the repo has a Dockerfile or compose file →
   automatically.
4. Otherwise → native scripts.

`beforeStart` (host-side: certs, env generation, migrations) still runs in
docker mode; the container replaces only `start:`. `afterStart` runs on stop
in both modes.

Check what a run would do without side effects:

```bash
corgi run --dry-run            # mode=native | docker (Dockerfile) | docker (repo compose)
corgi run --dry-run --docker
```

## Runner options

```yaml
services:
  web:
    cloneFrom: git@example.com:org/web.git
    port: 3100
    runner:
      name: docker
      dockerfile: Dockerfile.dev # default: Dockerfile
      context: .                 # build context, default: service dir
      target: dev                # multi-stage target
      args:
        NODE_VERSION: "22"
      volumes:
        - ./src:/app/src         # host paths relative to the service dir
      containerPort: 3000        # default: first EXPOSE, else port
      command: npm run dev       # override CMD
```

Scalar shorthand: `runner: docker`.

To use a specific compose file the repo ships instead of generating one:

```yaml
    runner:
      name: docker
      composeFile: ./docker-compose.dev.yml
```

`composeFile` and the build fields are mutually exclusive.

## Ports

`port:` is the host port. Inside the container corgi maps it to
`containerPort`, which defaults to the Dockerfile's first `EXPOSE`, then to
`port`. With `EXPOSE` present you can omit `port:` entirely — corgi reads it
from the Dockerfile.

For repo-compose services the repo's own `ports:` mapping applies; set
`port:` in corgi-compose so readiness probes and `corgi ps` know where to
look.

## Env, readiness, logs, lifecycle

- The service's corgi-generated `.env` (dependencies, db credentials,
  cross-service URLs) feeds the container, with `localhost` rewritten to
  `host.docker.internal` so containers reach host-side services and
  databases. Linux gets `host.docker.internal` via `host-gateway`.
- Readiness is unchanged: port probe or `healthCheck` path, plus `warmup`.
- `corgi logs <service>` works — container logs stream into the same log
  files (detached mode).
- `corgi ps` verifies the actual container state, `corgi stop` brings
  containers down (volumes survive; `corgi clean` removes them).
- Builds run concurrently — one goroutine per service, same
  dependency/database gating as native services.

## Troubleshooting

- **Base image needs auth** (private registry): run `docker login` for that
  registry first; corgi surfaces docker's own error.
- **No EXPOSE and no port** — corgi skips the service and says why; add
  `port:` or an `EXPOSE` line.
- **Docker daemon down** — corgi starts it when `useDocker: true` (Docker
  Desktop, OrbStack, Colima supported).
