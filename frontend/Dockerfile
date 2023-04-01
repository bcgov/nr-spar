# Build
FROM node:16.20.0-alpine3.17@sha256:b4a72f83f52bbe3970bb74a15e44ec4cf6e873ad4787473dfc8a26f5b4e29dd2 AS build

# Copy and build
WORKDIR /app
COPY . .
RUN yarn install --cwd frontend --frozen-lockfile --prefer-offline && \
    yarn --cwd frontend build:production && \
    rm -rf node_modules


# Deploy
FROM node:16.20.0-alpine3.17@sha256:b4a72f83f52bbe3970bb74a15e44ec4cf6e873ad4787473dfc8a26f5b4e29dd2

# Copy and prep app
WORKDIR /app
COPY --from=build /app/build/ .
RUN yarn global add serve@14.2.0 react-inject-env@2.1.0 && \
    chmod -R g+w .

# User and startup
EXPOSE 3000
USER 1001
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost/:3000
CMD react-inject-env set -d . && \
    serve -s .
