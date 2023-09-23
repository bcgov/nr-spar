# Build static files
# Node Bullseye has npm
FROM node:18.18.0-bullseye-slim AS build

# Build
WORKDIR /app
COPY *.html *.json *.ts ./
COPY ./src ./src
RUN npm ci --ignore-scripts --no-update-notifier --omit=dev && \
    npm run build && \
    rm -rf node_modules

# Deploy container
# Caddy serves static files
FROM caddy:2.7.4-alpine
RUN apk add --no-cache ca-certificates

# Copy files and run formatting
COPY --from=build /app/build/ /app/dist
COPY Caddyfile /etc/caddy/Caddyfile
RUN caddy fmt --overwrite /etc/caddy/Caddyfile

# User, port and healthcheck
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3000
USER 1001
