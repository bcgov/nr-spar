FROM postgis/postgis:15-master

# Enable pgcrypto extension on startup
RUN sed -i '/EXISTS postgis_tiger_geocoder;*/a CREATE EXTENSION IF NOT EXISTS pgcrypto;' \
        /docker-entrypoint-initdb.d/10_postgis.sh

WORKDIR /app
COPY pg-simple-backup.sh .

RUN mkdir /mnt/bkp

# User, port and Healthcheck
#USER postgres
ENTRYPOINT [ "/app/pg-simple-backup.sh", "$${POSTGRES_USER}", "$${POSTGRES_DB}", "15432" ]
