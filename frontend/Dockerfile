# Build
FROM node:16.19.1-alpine3.17 AS build

# Copy and build
WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile --prefer-offline
RUN yarn build:production
RUN rm -rf node_modules


# Deploy
FROM node:16.19.1-alpine3.17

# Copy and prep app
WORKDIR /app
COPY --from=build /app/build/ .
RUN yarn global add serve@14.2.0 react-inject-env@2.1.0 && \
    chmod -R g+w .

# User and startup
EXPOSE 3000
USER 1001
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3000/
CMD react-inject-env set -d . && \
    serve --no-clipboard --single .
