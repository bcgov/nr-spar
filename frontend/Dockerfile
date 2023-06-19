# Build
FROM node:18-bullseye-slim AS build

# Build
WORKDIR /app
COPY . .
RUN apt-get update && \
    apt-get install -y g++ make python3 && \
    yarn install --frozen-lockfile --prefer-offline && \
    yarn build:production && \
    rm -rf node_modules

# Deploy
FROM gcr.io/distroless/nodejs:18

# Copy and prep app
WORKDIR /app
COPY --from=build /app/build/ .
RUN yarn global add serve@14.2.0 react-inject-env@2.1.0 && \
    chmod -R g+w .

# Port, health check and user
EXPOSE 3000
HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1
USER 1001

# Startup
CMD react-inject-env set -d . && \
    serve --no-clipboard --single .
