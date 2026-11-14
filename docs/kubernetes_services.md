---
sidebar_position: 5
---

# Kubernetes services

A service can run in a Kubernetes cluster instead of on your machine. The rest
of the stack does not notice: corgi forwards the service's port to
`localhost:<port>`, so env, healthchecks, `depends_on_services` and the other
services work as before.

```yaml
services:
  api:
    path: ./api
    port: 3000
    runner:
      name: k8s                  # or: runner: k8s
      kubeContext: kind-dev      # kind create cluster --name dev
```

```bash
corgi run            # build, apply, wait, forward, logs
corgi stop           # removes what it applied
```

## Three ways to describe the workload

| you give | corgi does |
|---|---|
| nothing (a `Dockerfile` or `runner.image`) | builds the image and writes a Deployment and a Service, with a TCP readiness probe on the container port |
| `manifests: deploy/k8s` | `kubectl apply` of that file or folder (`-k` when it holds a `kustomization.yaml`) |
| `chart: deploy/chart` + `values: [...]` | `helm upgrade --install <service>` |

`corgi k8s manifests api` prints what the first row generates. Copy it into
`deploy/k8s` when you want to own it.

## What happens on `corgi run`

```
namespace ──▶ image ──▶ env Secret ──▶ apply ──▶ rollout status ──▶ port-forward + logs
```

1. **Namespace** `corgi-<stack name>` (or `runner.namespace`), made when missing.
2. **Image.** With a Dockerfile, corgi builds it and tags it by content
   (`corgi/<stack>-<service>:<image id>`), so a changed image always rolls
   out. It is loaded into kind, k3d or minikube; Docker Desktop, OrbStack,
   Rancher Desktop and colima share the Docker daemon and need no load.
   With `manifests` or `chart`, corgi builds only when you set a build field
   (`dockerfile`, `context`, `target`, `args`), then puts the image on the
   workload (`kubectl set image`, or `--set image.repository/tag` for a chart).
3. **Env.** The service's env becomes the Secret `corgi-<service>-env`.
   `localhost` and `127.0.0.1` point at your machine from inside the cluster:
   `host.docker.internal` (`host.minikube.internal` on minikube;
   `localhostNameInEnv` overrides it). The generated Deployment reads it with
   `envFrom`; your own manifests can too.
4. **Rollout.** corgi waits up to five minutes. When it fails, it prints the
   cluster's warning events: the image that would not pull, the probe that
   failed.
5. **Port-forward** from `127.0.0.1:<port>` to the container port
   (`runner.containerPort`, else the Dockerfile's `EXPOSE`, else `port`). It
   reconnects by itself when the pod restarts.
6. **Logs** from every pod go into the service's corgi log (`corgi logs api`).

`corgi stop` deletes exactly what corgi applied: the generated objects, your
manifests, or the helm release. The namespace stays.

## Which cluster

Without `kubeContext`, corgi uses the current context **only when it is a local
cluster** (`kind-*`, `k3d-*`, `minikube`, `docker-desktop`, `orbstack`,
`rancher-desktop`, `colima`). Any other cluster must be named in
`kubeContext`, so a `corgi run` never deploys to production because that was
the last context you used. A remote cluster cannot take a local build: push the
image and set `runner.image`.

## Options

| field | meaning |
|---|---|
| `kubeContext` | context to deploy to |
| `namespace` | default `corgi-<stack name>` |
| `manifests` | file or folder, relative to the service dir |
| `chart`, `values` | helm chart and values files |
| `resource` | workload to wait on and forward to, e.g. `statefulset/db`; default: the one named like the service, else the first applied |
| `image` | a pushed image instead of a build |
| `dockerfile`, `context`, `target`, `args` | the build, same as for Docker services |
| `containerPort` | port inside the pod |
| `command` | the container's command (`sh -c`), generated workloads only |

`volumes`, `composeFile` and `watch` belong to the Docker runner and are
refused here: put mounts in your manifests.

## Commands

```bash
corgi k8s status            # every k8s service: context, namespace, pods
corgi k8s manifests api     # the generated yaml
corgi k8s up api            # apply and forward one service by hand (--keep leaves it on exit)
corgi k8s down api          # remove it
corgi doctor                # kubectl, helm, kind, k3d, minikube, docker: whatever this stack needs
```
