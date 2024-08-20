#!/bin/sh
#
# Exit on errors or unset variables
set -eux

# Run and verify job

# Login
if [ ! -z "${2:-}" ]; then
  oc login --token=${2} --server=https://api.silver.devops.gov.bc.ca:6443
  oc project  #Safeguard!
fi

# Create job
CRONJOB=nr-spar-${1:-test}-sync
RUN_JOB=${CRONJOB}--$(date +"%Y-%m-%d--%H-%M-%S")
oc create job ${RUN_JOB} --from=cronjob/${CRONJOB}

# Follow
oc wait --for=condition=ready pod --selector=job-name=${RUN_JOB} --timeout=1m
oc logs -l job-name=${RUN_JOB} --tail=50 --follow

# Verify successful completion
oc wait --for jsonpath='{.status.phase}'=Succeeded pod --selector=job-name=${RUN_JOB} --timeout=1m
echo "Job successful!"
