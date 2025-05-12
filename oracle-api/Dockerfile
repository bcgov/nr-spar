FROM ghcr.io/graalvm/native-image:22.3.3 AS build

# Copy
WORKDIR /app
COPY . ./

# Build
RUN ./mvnw package -Pnative -DskipTests -Dskip.unit.tests=true && \
    javac InstallCert.java


### Deployer
FROM eclipse-temurin:17.0.15_6-jdk-jammy AS deploy

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
