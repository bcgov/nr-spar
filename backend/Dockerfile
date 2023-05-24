FROM ghcr.io/graalvm/native-image:ol8-java17-22 AS builder
ARG MAVEN_DOWNLOAD_URL=https://dlcdn.apache.org/maven/maven-3/3.9.2/binaries/apache-maven-3.9.2-bin.tar.gz

RUN microdnf update \
 && microdnf install --nodocs tar gzip \
 && microdnf clean all \
 && rm -rf /var/cache/yum

RUN mkdir -p /usr/share/maven /usr/share/maven/ref \
  && curl -fsSL -o /tmp/apache-maven.tar.gz ${MAVEN_DOWNLOAD_URL} \
  && tar -xzf /tmp/apache-maven.tar.gz -C /usr/share/maven --strip-components=1 \
  && rm -f /tmp/apache-maven.tar.gz \
  && ln -s /usr/share/maven/bin/mvn /usr/bin/mvn

# ENV MAVEN_HOME /usr/share/maven
# ENV MAVEN_CONFIG "~/.m2"

WORKDIR /app/src
COPY src .
WORKDIR /app
COPY pom.xml .

# Build
RUN mvn -Pnative native:compile -Dtests.skip=true

# # The deployment Image
FROM docker.io/oraclelinux:8-slim

EXPOSE 3000

# Copy the native executable into the containers
# COPY --from=builder /build/target/nr-spar-backend.jar .
WORKDIR /app
COPY --from=builder /app/target/ .

ENTRYPOINT ["/app/nr-spar-backend"]
