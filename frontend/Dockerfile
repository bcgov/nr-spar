# Build static files
# Node Bullseye has npm
FROM node:18.20.8-bullseye-slim@sha256:d69fb189fa7765636655db043a6a9e6be5ddf94bd1a8dc33fd0bcf4664606a9e AS build
ENV NODE_OPTIONS="--max-old-space-size=3072"

# Build
WORKDIR /app
COPY *.html *.json *.ts ./
COPY ./src ./src
COPY ./public ./public
RUN npm ci --ignore-scripts --no-update-notifier --omit=dev && \
    npm run build && \
    rm -rf node_modules

# Deploy container
# Caddy serves static files
FROM caddy:2.10.0-alpine@sha256:e2e3a089760c453bc51c4e718342bd7032d6714f15b437db7121bfc2de2654a6
RUN apk add --no-cache ca-certificates curl

# Copy files and run formatting
COPY --from=build /app/build/ /app/dist
COPY Caddyfile /etc/caddy/Caddyfile
RUN caddy fmt --overwrite /etc/caddy/Caddyfile

# User, port and healthcheck
EXPOSE 3000
HEALTHCHECK CMD curl -f http://localhost:3000
USER 1001
