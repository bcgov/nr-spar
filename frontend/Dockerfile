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
COPY Caddyfile /etc/caddy/Caddyfile
RUN chmod 770 /etc/caddy/Caddyfile
COPY --from=build /app/build /srv

# Port, healthcheck and user
EXPOSE ${PORT}
HEALTHCHECK CMD curl -f http://localhost/:${PORT}
USER 1001
