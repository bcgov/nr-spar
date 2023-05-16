FROM eclipse-temurin:17.0.6_10-jdk-alpine@sha256:a765a97826df90554f3d3a98be5586012bbc53593876f669ff4b2e68717be71d
WORKDIR /app
ENV LANG en_CA.UTF-8
ENV LANGUAGE en_CA.UTF-8
ENV LC_ALL en_CA.UTF-8

RUN apk --no-cache add openssl

COPY startup.sh .

RUN chmod g+w /app && \
    chmod g+x startup.sh && \
    chmod g+w ${JAVA_HOME}/lib/security/cacerts

# Port, user and entrypoint
EXPOSE 8090
USER 1001
HEALTHCHECK --interval=35s --timeout=4s CMD wget --spider -S http://localhost:8090/actuator/health || exit 1
ENTRYPOINT ["sh", "startup.sh"]
