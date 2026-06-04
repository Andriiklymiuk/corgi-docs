---
sidebar_position: 6
---

# Create database dump

![Db everywhere](/img/db_backup_meme.jpg)

**👋 How we can create a dump of the database? Let's go and follow the guide!**

## Quickest: let corgi do it

If the db_service declares a seed source (`seedFromFilePath` / `seedFromDb` /
`seedFromDbEnvPath`), corgi can dump and seed for you:

```bash
corgi run --seed          # dump from the seed source, then seed the new db
# or interactively:
corgi db                  # → choose service → choose "dump"
```

## From the CLI (pg_dump)

For Postgres, a one-liner — no GUI needed:

```bash
pg_dump "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" \
  --no-owner --no-privileges -f dump.sql
```

Place the resulting `dump.sql` next to the service in
`corgi_services/db_services/<service>/`, then seed it with `corgi db` → choose
service → **seed**. (`pg_dump` ships with the `postgresql` client tools.)

## With pgAdmin 4 (GUI)

Prefer a UI? Here's the pgAdmin route.

### Some requirements before starting:

- Docker
- pgAdmin 4
- Your happiness

### Create the dump in pgAdmin 4

- Open your database
- Go to your schema `Databases > ${DATABASE_NAME} > Schemas > Public`
- Click Right on it and Select **Backup**
- `DATABASE_NAME` variable can be replaced by any db name.

#### **`General` Tab**

- Fill the field **Filename** as example _dump.sql_
- Fill the field **Format** and select **Plain**

#### **`Dump options` Tab**

In `type of objects` section ✅ `blobs` field

In `do not save` section ✅ `owner`,`privilege`, `unlogged table data` fields

In `queries` section ✅ everything, except `Load via partition root`

Thanks to Nicolas for provided info nicolas.zamarreno@skeepers.io

[Main docs](/docs/intro)
