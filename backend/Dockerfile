# Build
FROM maven:3.8.7-eclipse-temurin-17 AS build

# Copy and build
WORKDIR /app
COPY pom.xml .
COPY ./src ./src
RUN mvn --no-transfer-progress --update-snapshots -P prod clean package

# Deploy
FROM eclipse-temurin:17-jre-alpine
ENV LANG en_CA.UTF-8
ENV LANGUAGE en_CA.UTF-8
ENV LC_ALL en_CA.UTF-8

# Copy app
WORKDIR /app
COPY --from=build /app/target/nr-spar_backend.jar app.jar

# User and startup
EXPOSE 8090
USER 1001
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "${JAVA_OPTS}", "-jar", "app.jar"]
