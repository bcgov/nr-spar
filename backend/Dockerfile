### Builder
# Native image build. JDK 17 matches the java.version property in pom.xml; same
# builder as oracle-api. Possible now that JasperReports (runtime bytecode
# compilation) has been replaced by Thymeleaf + OpenHTMLtoPDF.
FROM ghcr.io/graalvm/native-image:22.3.3 AS build

# Copy
WORKDIR /app
COPY pom.xml mvnw ./
COPY src ./src
COPY .mvn/ ./.mvn

# Build
RUN ./mvnw -B package -Pnative -DskipTests


### Deployer
FROM gcr.io/distroless/java-base:nonroot AS deploy
ARG PORT=8090

# Copy
WORKDIR /app
COPY --from=build /app/target/nr-spar-backend ./nr-spar-backend

# User and port
USER 1001
EXPOSE ${PORT}

# No HEALTHCHECK: distroless has no shell, curl or wget to run one. OpenShift
# ignores HEALTHCHECK and uses the Deployment's readiness/liveness probes
# (actuator /health on the management port, 8091). Same approach as
# nr-forest-client's native backend.

# Startup
ENTRYPOINT ["/app/nr-spar-backend", "-Dspring.profiles.active=prod"]
