FROM maven:3.8.7-eclipse-temurin-17 AS build

# User
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

# App
WORKDIR /home/spring
COPY src /home/spring/src
COPY pom.xml /home/spring
RUN mvn --no-transfer-progress --update-snapshots -P prod clean package

FROM eclipse-temurin:17.0.7_7-jre-jammy AS deploy

ENV LANG en_CA.UTF-8
ENV LANGUAGE en_CA.UTF-8
ENV LC_ALL en_CA.UTF-8

# App
WORKDIR /usr/share/service/
COPY --from=build /home/spring/target/nr-spar-backend.jar /usr/share/service/service.jar
COPY dockerfile-entrypoint.sh /usr/share/service/dockerfile-entrypoint.sh

# User, port and healthcheck
USER 1001
EXPOSE 8090
HEALTHCHECK --interval=30s --timeout=5s --retries=5 --start-period=30s \
  CMD curl -f http://localhost:8090/actuator/health | grep '"status":"UP"'
ENTRYPOINT ["/usr/share/service/dockerfile-entrypoint.sh"]
