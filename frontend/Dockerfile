# Build static files
FROM node:18.16.1-alpine3.17 AS build

# Build
WORKDIR /app
COPY . .
RUN apk add --no-cache python3 g++ make && \
    npm install && \
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

# Port, health check and non-root user
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3000
USER 1001
