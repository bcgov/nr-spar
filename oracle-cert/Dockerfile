FROM eclipse-temurin:17.0.6_10-jdk-alpine
WORKDIR /app
ENV LANG en_CA.UTF-8
ENV LANGUAGE en_CA.UTF-8
ENV LC_ALL en_CA.UTF-8


COPY startup.sh .

RUN apk --no-cache add openssl && \
    chmod g+w /app && \
    chmod g+x startup.sh && \
    chmod g+w ${JAVA_HOME}/lib/security/cacerts

# User and health check
USER 1001
HEALTHCHECK CMD [ -d /cert/ ]

# Start
ENTRYPOINT ["sh", "startup.sh"]
