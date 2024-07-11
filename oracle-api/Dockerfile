### Builder
FROM ghcr.io/graalvm/native-image:22.3.3 AS build

# Copy and build
WORKDIR /app
COPY . ./
RUN ./mvnw package -Pnative -DskipTests -Dskip.unit.tests=true -Dspring-boot.run.profiles=prod && \
    javac InstallCert.java


### Deployer
FROM gcr.io/distroless/java-base:nonroot
# FROM eclipse-temurin:17.0.11_9-jdk-jammy

# Java vars
ENV LANG=en_CA.UTF-8
ENV LANGUAGE=en_CA.UTF-8
ENV LC_ALL=en_CA.UTF-8

# Setup package/archive and supporting files
WORKDIR /usr/share/service/
COPY --from=build /app/target/*.jar /app/*.class /app/entrypoint.sh ./artifacts/

# RUN mkdir config dump public && \
#     chmod -R g+w . && \
#     chmod g+x dockerfile-entrypoint.sh && \
#     chmod g+w ${JAVA_HOME}/lib/security/cacerts

# User, port and healthcheck
USER 1001
EXPOSE 8091
HEALTHCHECK CMD curl -f http://localhost:8091/actuator/health | grep '"status":"UP"'

# Start
ENTRYPOINT ["/usr/share/service/artifacts/entrypoint.sh"]
