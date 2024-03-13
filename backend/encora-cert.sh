#!/bin/bash

# Import certificates - Needed by Encora ZScaler VPN
if [ -f "/certs/ziaroot.crt" ]; then
  keytool -import -trustcacerts -file /certs/ziaroot.crt -keystore $JAVA_HOME/lib/security/cacerts -storepass changeit -noprompt
fi

if [ -f "/certs/zscaler-ca.crt" ]; then
  keytool -import -trustcacerts -file /certs/zscaler-ca.crt -keystore $JAVA_HOME/lib/security/cacerts -storepass changeit -noprompt
fi

mvn -ntp spring-boot:run \
    -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=*:5005" \
    -Dmaven.plugin.validation=VERBOSE