### Builder
FROM ghcr.io/graalvm/native-image:ol8-java17-22 AS build

# Copy
WORKDIR /app
COPY pom.xml mvnw ./
COPY src ./src
COPY .mvn/ ./.mvn

# Build
RUN ./mvnw package -Pnative -DskipTests -Dspring-boot.run.profiles=prod


### Deployer
FROM debian:bookworm-slim AS deploy
ARG PORT=8090

# Copy
WORKDIR /app
COPY --from=build /app/target/nr-spar-backend ./nr-spar-backend

# User, port and health check
USER 1001
EXPOSE ${PORT}
HEALTHCHECK CMD timeout 10s bash -c 'true > /dev/tcp/127.0.0.1/8090'

# Startup
ENTRYPOINT ["/app/nr-spar-backend"]
