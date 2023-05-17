FROM openjdk:17.0.2 AS build

# Build
WORKDIR /app
COPY . ./
RUN ./mvnw --no-transfer-progress --update-snapshots clean package -Dtests.skip=true -Dskip.unit.tests=true && \
    javac HealthCheck.java InstallCert.java

FROM eclipse-temurin:17.0.7_7-jdk-jammy AS deploy

# Java vars
ENV LANG en_CA.UTF-8
ENV LANGUAGE en_CA.UTF-8
ENV LC_ALL en_CA.UTF-8

# Setup package/archive and supporting files
WORKDIR /usr/share/service/
COPY --from=build /app/target/*.jar \
                /app/HealthCheck.class \
                /app/InstallCert.class \
                /app/InstallCert\$SavingTrustManager.class \
                ./artifacts/
COPY dockerfile-entrypoint.sh ./
RUN mkdir config dump public && \
    chmod -R g+w . && \
    chmod g+x dockerfile-entrypoint.sh && \
    chmod g+w ${JAVA_HOME}/lib/security/cacerts

# User, port and healthcheck
USER 1001
EXPOSE 8090
HEALTHCHECK --interval=5s --timeout=5s --retries=5 --start-period=45s \
  CMD curl -f http://localhost:8090/actuator/health | grep '"status":"UP"'

# Start
ENTRYPOINT ["/usr/share/service/dockerfile-entrypoint.sh"]
