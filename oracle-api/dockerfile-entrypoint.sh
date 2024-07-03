#!/bin/sh

java -cp /usr/share/service/artifacts/ InstallCert --quiet "${DATABASE_HOST}:${DATABASE_PORT}"
keytool -exportcert -alias "${DATABASE_HOST}-1" -keystore jssecacerts -storepass changeit -file oracle.cer
keytool -importcert -alias orakey -noprompt -cacerts -storepass changeit -file oracle.cer

java \
    -Djava.security.egd=file:/dev/./urandom \
    ${JAVA_OPTS} \
    -jar \
    -Dspring.profiles.active=prod
    /usr/share/service/artifacts/nr-spar-oracle-api.jar
