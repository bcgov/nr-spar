# RedHat UBI 8 with nodejs 14
FROM postgis/postgis:13-master@sha256:030cb327736b4f06b6f8d5d33ebd4f8818e73c1bdf9a70ba55944df60c54ba5c

# Enable pgcrypto extension on startup
RUN sed -i '/EXISTS postgis_tiger_geocoder;*/a CREATE EXTENSION IF NOT EXISTS pgcrypto;' \
        /docker-entrypoint-initdb.d/10_postgis.sh

# Non-privileged user
USER postgres
