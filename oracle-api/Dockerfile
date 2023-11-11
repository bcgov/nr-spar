FROM openjdk:17.0.2 AS build

# Build
WORKDIR /app
COPY . ./
RUN ./mvnw --no-transfer-progress --update-snapshots clean package -Dtests.skip=true -Dskip.unit.tests=true -Dspring-boot.run.profiles=prod && \
    javac HealthCheck.java InstallCert.java

FROM eclipse-temurin:17.0.9_9-jdk-jammy AS deploy

# Java vars
ENV LANG en_CA.UTF-8
ENV LANGUAGE en_CA.UTF-8
ENV LC_ALL en_CA.UTF-8

# Setup package/archive and supporting files
WORKDIR /usr/share/service/
COPY --from=build /app/target/*.jar /app/*.class ./artifacts/
COPY dockerfile-entrypoint.sh ./
RUN mkdir config dump public && \
    chmod -R g+w . && \
    chmod g+x dockerfile-entrypoint.sh && \
    chmod g+w ${JAVA_HOME}/lib/security/cacerts

# User, port and healthcheck
USER 1001
EXPOSE 8091
HEALTHCHECK CMD curl -f http://localhost:8091/actuator/health | grep '"status":"UP"'

# Start
ENTRYPOINT ["/usr/share/service/dockerfile-entrypoint.sh"]
