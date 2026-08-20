### Builder
# Maven version matches .mvn/wrapper/maven-wrapper.properties. JDK 17 matches the
# java.version property in pom.xml.
FROM maven:3.9.16-eclipse-temurin-17 AS build
WORKDIR /workspace/app

COPY pom.xml .
COPY .mvn/ ./.mvn
COPY src src

# JasperReports compiles report expressions to bytecode and loads them through its own
# classloader, which a GraalVM native image cannot do, so this builds a JVM jar.
RUN mvn -B package -Pprod -DskipTests
RUN mkdir -p target/dependency && (cd target/dependency; jar -xf ../*.jar)


### Deployer
FROM eclipse-temurin:17-jdk-alpine
ARG PORT=8090

USER 1001
VOLUME /tmp
ARG DEPENDENCY=/workspace/app/target/dependency
COPY --from=build ${DEPENDENCY}/BOOT-INF/lib /app/lib
COPY --from=build ${DEPENDENCY}/META-INF /app/META-INF
COPY --from=build ${DEPENDENCY}/BOOT-INF/classes /app

EXPOSE ${PORT}

# OpenShift ignores HEALTHCHECK in favour of the Deployment's readiness/liveness
# probes, but Trivy (DS-0026) and `docker run` outside K8s both expect one.
# Actuator listens on the management port with management.endpoints.web.base-path=/,
# so the path is /health on 8091, not /actuator/health on 8090. Uses BusyBox wget:
# this base has no bash and no curl. --start-period gives Spring time to boot
# before failures count against the container's health state.
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=5 \
  CMD wget -q -O /dev/null http://127.0.0.1:8091/health || exit 1

# Heap is sized as a percentage of the container's cgroup memory limit rather than
# a fixed -Xmx, so it tracks MEMORY_LIMIT in openshift.deploy.yml instead of
# drifting out of sync. 60% leaves room for metaspace (capped below), the JIT code
# cache, thread stacks, and the buffers Jasper allocates while filling a report.
# Exceeding the limit gets the container OOM-killed by the kernel, which produces
# no Java stack, so fail on heap exhaustion instead.
#
# TieredStopAtLevel=1 stops at the C1 JIT: faster warmup, lower peak throughput.
ENTRYPOINT ["java","-XX:InitialRAMPercentage=30","-XX:MaxRAMPercentage=60","-XX:TieredStopAtLevel=1","-XX:+UseParallelGC","-XX:MinHeapFreeRatio=20","-XX:MaxHeapFreeRatio=40","-XX:GCTimeRatio=4","-XX:AdaptiveSizePolicyWeight=90","-XX:MaxMetaspaceSize=200m","-XX:ParallelGCThreads=2","-Djava.util.concurrent.ForkJoinPool.common.parallelism=8","-XX:CICompilerCount=2","-XX:+ExitOnOutOfMemoryError","-Djava.security.egd=file:/dev/./urandom","-Dspring.profiles.active=prod","-cp","app:app/lib/*","ca.bc.gov.backendstartapi.BackendStartApiApplication"]
