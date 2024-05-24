#!/bin/bash
# -*- coding: utf-8 -*-

# Variables
PROJECT="b9d53b-test"
PORT=15432

# Prod option: Just call the script with "./pg-test-portforward.sh prod"
if [ "$1" == "prod" ] || [ "$1" == "PROD" ]; then
  echo "Switching to PROD instead of TEST!"
  PROJECT="b9d53b-prod"
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
echo "Setting project..."
oc project $PROJECT

# 2. Get the pod name
echo "Looking for database running pods on OpenShift..."
POD_NAME=$(oc get pods | grep nr-spar-test-database | grep Running | cut -d ' ' -f 1)
if [ "$POD_NAME" == "" ]; then
  echo "Unable to find a database Running pod! Leaving!"
  exit 1;
else
  echo "OK! Pod found! Name: $POD_NAME"
fi

# 3. Get DB name, user and password
echo "Getting credentials..."
SECRETS=$(oc extract secret/nr-spar-test-database -n b9d53b-test --to=- 2> /dev/null)
DB_NAME=$(echo $SECRETS | cut -d ' ' -f 1)
DB_USER=$(echo $SECRETS | cut -d ' ' -f 3)
DB_PASS=$(echo $SECRETS | cut -d ' ' -f 2)
echo "Use this information to set up the database connection on your end:"
echo "- DB_HOST = localhost"
echo "- DB_PORT = $PORT"
echo "- DB_NAME = '$DB_NAME'"
echo "- DB_USER = '$DB_USER'"
echo "- DB_PASS = '$DB_PASS'"

echo "Starting port forwarding... Press Ctrl+C to stop"
oc port-forward $POD_NAME $PORT:5432
