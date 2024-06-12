# SPAR DB Documentation

## Schema Spy

Schema Spy provides a simple way of generating a great UI, web page, 
containing all database tables, triggers, views, and more.

It provides a easy way of search for tables, columns, and pretty much
any information on the database schema definition.

## Running locally

Currently there's no deployed page available. However, with Docker +
Docker compose plugin you can easily run it, generating all web pages
and its content, with the latest definitions (based on your branch state).

Here's how:

```sh
docker compose --profile schemaspy up -d
```

With that you should be able to get:

- Postgres Database up and running on port 5432
- Backend service up and running, including all migrations
- Schema Spy updated files inside `schemaspy` directory.

Now open up the file `schemaspy/index.html` on your browser and enjoy :)

## Config file

The config file can be found at the `schemaspy` directory, named `postgres.properties`.

## References

- **SchemaSpy on GitHub**: https://github.com/schemaspy/schemaspy
- **SchemaSpy on Docker Hub**: https://hub.docker.com/r/schemaspy/schemaspy
- **SchemaSpy documentation**: https://schemaspy.readthedocs.io/en/latest/overview.html
