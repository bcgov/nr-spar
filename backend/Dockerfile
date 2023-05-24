### Builder
FROM ghcr.io/graalvm/native-image:ol8-java17-22 AS builder

# Packages
RUN microdnf update \
  && microdnf install --nodocs tar gzip \
  && microdnf clean all \
  && rm -rf /var/cache/yum

# Maven
ARG MAVEN_DOWNLOAD_URL=https://dlcdn.apache.org/maven/maven-3/3.9.2/binaries/apache-maven-3.9.2-bin.tar.gz
RUN mkdir -p /usr/share/maven /usr/share/maven/ref \
  && curl -fsSL -o /tmp/apache-maven.tar.gz ${MAVEN_DOWNLOAD_URL} \
  && tar -xzf /tmp/apache-maven.tar.gz -C /usr/share/maven --strip-components=1 \
  && rm -f /tmp/apache-maven.tar.gz \
  && ln -s /usr/share/maven/bin/mvn /usr/bin/mvn

# # Envars
ENV MAVEN_HOME /usr/share/maven
ENV MAVEN_CONFIG "/root/.m2"

# Copy
WORKDIR /app
COPY pom.xml .
COPY src ./src

# Build
RUN mvn -Pnative native:compile -Dtests.skip=true


### Deployer
FROM docker.io/oraclelinux:8-slim

# Copy
COPY --from=builder /app/target/nr-spar-backend ./

# User, port and health check
EXPOSE 8090
HEALTHCHECK CMD curl -f http://localhost:8090/actuator/health | grep '"status":"UP"'

# Startup
ENTRYPOINT ["/nr-spar-backend"]
