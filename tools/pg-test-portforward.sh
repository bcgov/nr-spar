#!/bin/bash
# -*- coding: utf-8 -*-

# Variables
TARGET_ENV="test"
PORT=15432

# Prod option: Just call the script with "./pg-test-portforward.sh prod"
if [ "$1" == "prod" ] || [ "$1" == "PROD" ]; then
  echo "Switching to PROD instead of TEST!"
  TARGET_ENV="prod"
else
  echo "Starting port-forward script for TEST. You also can do './pg-test-portforward.sh prod'"
fi

# Check for VPN
echo "Looking for VPN..."
if ping -c1 api.silver.devops.gov.bc.ca &> /dev/null; then
  echo "VPN OK!"
else
  echo "Oops. You need the VPN for this. Leaving!"
  exit
fi

# Check for oc login
echo "Looking for OC login status..."
OC_USER=$(oc whoami 2&> /dev/null && echo 'OK' || echo 'NO')
if [ "$OC_USER" == "OK" ]; then
  echo "OC login OK!"
else
  echo "Oops. You need to be logged in on the OpenShift CLI (oc)! Leaving!"
  exit 1;
fi

# 1. Set the project
PROJECT="b9d53b-$TARGET_ENV"
echo "Setting project..."
oc project $PROJECT

# 2. Get the pod name
echo "Looking for database running pods on OpenShift..."
POD_NAME=$(oc get pods | grep nr-spar-"$TARGET_ENV"-database | grep Running | cut -d ' ' -f 1)
if [ "$POD_NAME" == "" ]; then
  echo "Unable to find a Running pod on $TARGET_ENV! Leaving!"
  exit 1;
else
  echo "OK! Pod found! Name: $POD_NAME"
fi

# 3. Get DB name, user and password
echo "Getting credentials..."
DB_NAME=$(oc extract secret/nr-spar-$TARGET_ENV-database -n b9d53b-$TARGET_ENV --keys=database-name --to=- 2> /dev/null)
DB_USER=$(oc extract secret/nr-spar-$TARGET_ENV-database -n b9d53b-$TARGET_ENV --keys=database-user --to=- 2> /dev/null)
DB_PASS=$(oc extract secret/nr-spar-$TARGET_ENV-database -n b9d53b-$TARGET_ENV --keys=database-password --to=- 2> /dev/null)
echo "Use this information to set up the database connection with '$TARGET_ENV' on your end:"
echo "- DB_HOST = localhost"
echo "- DB_PORT = $PORT"
echo "- DB_NAME = '$DB_NAME'"
echo "- DB_USER = '$DB_USER'"
echo "- DB_PASS = '$DB_PASS'"

echo "Starting port forwarding... Press Ctrl+C to stop"
oc port-forward $POD_NAME $PORT:5432
