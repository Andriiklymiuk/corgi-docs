---
sidebar_position: 2
---

# What is my purpose?

As we expand services and go towards microservices architecture, we need to
somehow test many databases, that are started and run locally.

Creation, seeding, recreation of database is pretty cumbersome task, which this
cli wants to improve.

It uses docker compose under the hood to run specific db instance in
containerized fashion, which helps to start service and stop it, fill with info,
etc fast.

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
      - To launch locally sync-go-trigger service manually
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

1. It adds corgi compose files to gitignore
2. Creates folder with db helpers files in in `corgi_services/db_services`
   folder. These files are created, so that you can run db_services manually, if
   you want.
3. If the path provided doesn't exist and cloneFrom is provided, than it will
   run git clone with provided url. So, for example, you provide path to
   service: `./myWoofServices/corgiserver`, than it will run git clone in
   `./myWoofServices/` folder. **Bare in mind**, that git clone should create
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
