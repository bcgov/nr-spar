# Import certificates - For Encora folks, needed by ZScaler Encora VPN
if [ -f "$HOME/zscaler-certs/ziaroot.crt" ]; then
  keytool -import -trustcacerts -file $HOME/zscaler-certs/ziaroot.crt -keystore $JAVA_HOME/lib/security/cacerts -storepass changeit -noprompt
fi

if [ -f "$HOME/zscaler-certs/zscaler-ca.crt" ]; then
  keytool -import -trustcacerts -file $HOME/zscaler-certs/zscaler-ca.crt -keystore $JAVA_HOME/lib/security/cacerts -storepass changeit -noprompt
fi

mvn -ntp spring-boot:run \
    -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=*:5005" \
    -Dmaven.plugin.validation=VERBOSE