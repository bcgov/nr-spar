FROM postgis/postgis:15-master

# Enable pgcrypto extension on startup
RUN sed -i '/EXISTS postgis_tiger_geocoder;*/a CREATE EXTENSION IF NOT EXISTS pgcrypto;' \
        /docker-entrypoint-initdb.d/10_postgis.sh

# User, port and Healthcheck
USER postgres
EXPOSE 5432
HEALTHCHECK CMD ["psql", "-q", "-U", "$${POSTGRES_USER}", "-d", "$${POSTGRES_DB}", "-c", "SELECT 1"]
