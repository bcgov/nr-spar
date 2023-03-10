# Build container
FROM openjdk:17.0.2 AS build

# Build package/archive
WORKDIR /app
COPY . ./
RUN ./mvnw --no-transfer-progress --update-snapshots clean package -Dtests.skip=true -Dskip.unit.tests=true

# Deploy container
FROM eclipse-temurin:17-jre-alpine AS deploy
ENV LANG en_CA.UTF-8
ENV LANGUAGE en_CA.UTF-8
ENV LC_ALL en_CA.UTF-8

# Setup package/archive and supporting files
WORKDIR /usr/share/service/
COPY --from=build /app/target/*.jar ./artifacts/
COPY dockerfile-entrypoint.sh HealthCheck.java InstallCert.java ./
RUN mkdir config dump public && \
    chmod -R g+w . && \
    chmod g+x dockerfile-entrypoint.sh && \
    chmod g+w ${JAVA_HOME}/lib/security/cacerts

# Port, user and entrypoint
EXPOSE 8090
USER 1001
HEALTHCHECK --interval=35s --timeout=4s CMD wget --spider -S http://127.0.0.1:8090/check
ENTRYPOINT ["/usr/share/service/dockerfile-entrypoint.sh"]
