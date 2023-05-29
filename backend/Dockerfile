### Builder
FROM ghcr.io/graalvm/native-image:ol8-java17-22 AS build

# Copy
WORKDIR /app
COPY pom.xml mvnw ./
COPY src ./src
COPY .mvn/ ./.mvn

# Build
RUN ./mvnw -Pnative native:compile -Dtests.skip=true


### Deployer
FROM gcr.io/distroless/java-base AS deploy
ARG PORT=8090

# Copy
WORKDIR /app
COPY --from=build /app/target/nr-spar-backend ./nr-spar-backend

# User, port and health check
USER 1001
EXPOSE ${PORT}
HEALTHCHECK CMD curl -f http://localhost:${PORT}/actuator/health | grep '"status":"UP"'

# Startup
ENTRYPOINT ["/app/nr-spar-backend"]
