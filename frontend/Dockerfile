FROM node:18.17.1-alpine3.17 AS build

# Build
WORKDIR /app
COPY . .
RUN apk add --no-cache python3 g++ make && \
    npm ci && \
    npm run build && \
    rm -rf node_modules

# Caddy
FROM caddy:2.7.2-alpine

# Copy static files and config
COPY --from=build /app/build/ /app/dist
COPY --from=build /app/Caddyfile /etc/caddy/Caddyfile

# Packages and caddy format
RUN apk add --no-cache ca-certificates && \
    caddy fmt --overwrite /etc/caddy/Caddyfile

# User, port and healthcheck
USER 1001
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3000
