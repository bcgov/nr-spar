#!/bin/sh

CERT_DEST_FOLDER="/app"
CERT_FILE="jssecacerts"

generate_cert() {
  echo "Trying to get $DATABASE_HOST-1 certificate..."
  echo "Connecting to $DATABASE_HOST:$DATABASE_PORT..."

  openssl s_client -connect ${DATABASE_HOST}:${DATABASE_PORT} -showcerts </dev/null | openssl x509 -outform pem > $CERT_DEST_FOLDER/${DATABASE_HOST}.pem
  if [ "$?" -ne 0 ]; then
    echo "Unable to connect to the database! Are you connected in the VPN??"
    exit 1
  fi

  openssl x509 -outform der -in $CERT_DEST_FOLDER/${DATABASE_HOST}.pem -out $CERT_DEST_FOLDER/${DATABASE_HOST}.der
  if [ "$?" -ne 0 ]; then
    echo "Unable to save the certificate file!"
    exit 1
  fi

  keytool -import -alias ${DATABASE_HOST} -keystore $CERT_DEST_FOLDER/$CERT_FILE -file $CERT_DEST_FOLDER/${DATABASE_HOST}.der -storepass ${ORACLEDB_SECRET} -noprompt
  if [ "$?" -ne 0 ]; then
    echo "Unable to import the certificate file to the keystore!"
    exit 1
  fi

  if [ ! -f "$CERT_DEST_FOLDER/$CERT_FILE" ]; then
    echo "The certificate file is NOT present! Please check"
    echo "command: keytool -import -alias ${DATABASE_HOST} -keystore $CERT_DEST_FOLDER/$CERT_FILE -file $CERT_DEST_FOLDER/${DATABASE_HOST}.der -storepass ${ORACLEDB_SECRET} -noprompt"
    exit 1
  fi

  echo "Successfully got $CERT_FILE file and stored into $CERT_DEST_FOLDER."
}

if [ -z "$DATABASE_HOST" ]; then
  echo "DATABASE_HOST env var not set!"
  exit 1;
fi

if [ -z "$DATABASE_PORT" ]; then
  echo "DATABASE_PORT env var not set!"
  exit 1;
fi

if [ -z "$ORACLEDB_SECRET" ]; then
  echo "ORACLEDB_SECRET env var not set!"
  exit 1;
fi

if [ -f "$CERT_DEST_FOLDER/$CERT_FILE" ]; then
  echo "The certificate file is present! Nothing to do."
else
  generate_cert
fi

# Based on ForestClient script: https://github.com/bcgov/nr-forest-client/blob/main/common/startup.sh
