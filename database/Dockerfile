FROM postgis/postgis:15-master

COPY postgresql.conf /tmp/postgresql.conf
COPY updateConfig.sh /docker-entrypoint-initdb.d/_updateConfig.sh

# Enable pgcrypto extension on startup
RUN sed -i '/EXISTS postgis_tiger_geocoder;*/a CREATE EXTENSION IF NOT EXISTS pgcrypto;' \
        /docker-entrypoint-initdb.d/10_postgis.sh

# User, port and Healthcheck
USER postgres
EXPOSE 5432
HEALTHCHECK --interval=5s --timeout=5s --retries=5 CMD [ "pg_isready", "-U", "postgres"]
