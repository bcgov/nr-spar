FROM ghcr.io/graalvm/native-image:22.3.3@sha256:4aeee052a80237fa8b32c074d2b7b7adc92271fc4bda724f0b1c2ea0f2f884cb AS build

# Copy
WORKDIR /app
COPY . ./

# Build
RUN ./mvnw package -Pnative -DskipTests -Dskip.unit.tests=true && \
    javac InstallCert.java


### Deployer
FROM eclipse-temurin:17.0.15_6-jdk-jammy@sha256:d80cf84d4d49682f047cb303a11be1fcc8322b1e4cd7a7c2b17454085c1f2ffb AS deploy

# Java vars
ENV LANG=en_CA.UTF-8
ENV LANGUAGE=en_CA.UTF-8
ENV LC_ALL=en_CA.UTF-8

# Setup package/archive and supporting files
WORKDIR /app
COPY --from=build /app/target/nr-spar-oracle-api ./nr-spar-oracle-api
COPY --from=build /app/*.class ./artifacts/
COPY --from=build /app/install_cert.sh ./

# User, port and healthcheck
USER 1001
EXPOSE 8091
HEALTHCHECK CMD curl -f http://localhost:8091/actuator/health | grep '"status":"UP"'

# Start
ENTRYPOINT ["/app/nr-spar-oracle-api", "-Dspring.profiles.active=prod"]
