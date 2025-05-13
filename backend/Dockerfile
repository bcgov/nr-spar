### Builder
FROM ghcr.io/graalvm/native-image:22.3.3@sha256:4aeee052a80237fa8b32c074d2b7b7adc92271fc4bda724f0b1c2ea0f2f884cb AS build

# Copy
WORKDIR /app
COPY pom.xml mvnw ./
COPY src ./src
COPY .mvn/ ./.mvn

# Build
RUN ./mvnw -B package -Pnative -DskipTests


### Deployer
FROM gcr.io/distroless/java-base:nonroot@sha256:71ca0e469a097f72e74edceb9d7e2951a1fb6b44c851b6cc482c1c86408a947e AS deploy
ARG PORT=8090

# Copy
WORKDIR /app
COPY --from=build /app/target/nr-spar-backend ./nr-spar-backend

# User, port and health check
USER 1001
EXPOSE ${PORT}
HEALTHCHECK CMD timeout 10s bash -c 'true > /dev/tcp/127.0.0.1/8090'

# Startup
ENTRYPOINT ["/app/nr-spar-backend", "-Dspring.profiles.active=prod"]
