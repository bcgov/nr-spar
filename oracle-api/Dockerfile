# Global args
ARG workdir=app

# Build container
FROM openjdk:17.0.2@sha256:528707081fdb9562eb819128a9f85ae7fe000e2fbaeaf9f87662e7b3f38cb7d8 as build
ARG workdir

# Build package/archive
WORKDIR /${workdir}
COPY . ./
RUN ./mvnw clean package -DskipTests -Dtests.skip=true -Dskip.unit.tests=true -q

# Deploy container
FROM eclipse-temurin:17-jre-alpine AS deploy
ARG workdir
ENV LANG en_CA.UTF-8
ENV LANGUAGE en_CA.UTF-8
ENV LC_ALL en_CA.UTF-8

# Copy package/archive and entrypoint script
WORKDIR /${workdir}
COPY --from=build /${workdir}/target/*.jar ./
COPY dockerfile-entrypoint.sh ./

# Port, user and entrypoint
EXPOSE 8090
USER 1001
ENTRYPOINT ["/${workdir}/dockerfile-entrypoint.sh"]


# COPY InstallCert.java .
# COPY HealthCheck.java .
