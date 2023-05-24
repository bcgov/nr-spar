### Global args
ARG PORT 3000


### Build
FROM node:16.19.1-alpine3.17 AS build

# Build static files
WORKDIR /app
COPY . .
RUN apk add --no-cache python3 g++ make && \
    yarn install --frozen-lockfile --prefer-offline && \
    yarn build:production && \
    rm -rf node_modules


### Deploy w/ arg
FROM caddy:2.4.6-alpine AS deploy
ARG PORT

# Copy and prep app
WORKDIR /app
COPY --from=build /app/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/build /srv

# Port, Healthcheck and user
EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost/:${PORT} || exit 1
USER app
