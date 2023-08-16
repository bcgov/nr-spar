FROM node:18.17.1-alpine3.17 AS build

# Build
WORKDIR /app
COPY . .
RUN apk add --no-cache python3 g++ make && \
    yarn install --frozen-lockfile --prefer-offline && \
    yarn build:production && \
    rm -rf node_modules

FROM node:18.17.1-alpine3.17 AS deploy

# Copy and prep app
WORKDIR /app
COPY --from=build /app/build/ .
RUN yarn global add serve@14.2.0 react-inject-env@2.1.0 && \
    chmod -R g+w .

# User, port and healthcheck
USER 1001
EXPOSE 3000
HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Startup
CMD react-inject-env set -d . && \
    serve --no-clipboard --single .
