#!/bin/sh
#
# Exit on errors or unset variables
set -eu

# Run and verify ETL jobs in OpenShift
#
# Usage: ./oc_run.sh [pr#|test|prod] [optional:token]

# Check inputs
if [ -z "${1:-}" ]; then
  echo -e "\nAn environment input is required.  Exiting.\n"
  exit 1
fi

# Login (optional)
if [ ! -z "${2:-}" ]; then
  oc login --token=${2} --server=https://api.silver.devops.gov.bc.ca:6443
  oc project #Safeguard!
fi

# Create job
CRONJOB=nr-spar-${1}-database-backup
RUN_JOB=${CRONJOB}--$(date +"%Y-%m-%d--%H-%M-%S")
oc create job ${RUN_JOB} --from=cronjob/${CRONJOB}

# Wait for the pod to exist before following it. `oc wait` with a label selector
# does not wait for a match to appear - it fails immediately with "no matching
# resources found" if the pod has not been scheduled yet, which killed the script
# (and left the job running unmonitored) on a slow scheduler.
ATTEMPTS=90
while [ ${ATTEMPTS} -gt 0 ] && [ -z "$(oc get pods -l job-name=${RUN_JOB} -o name)" ]; do
  ATTEMPTS=$((ATTEMPTS - 1))
  sleep 2
done
if [ ${ATTEMPTS} -eq 0 ]; then
  echo "Pod for ${RUN_JOB} never appeared."
  oc describe job/${RUN_JOB}
  exit 1
fi

# Follow
oc logs -l job-name=${RUN_JOB} --tail=50 --follow

# Verify successful completion against the job, not the pod phase: a pod that
# finishes quickly never satisfies condition=ready, and its phase is racy.
# With backoffLimit 0 a failed job never reaches condition=complete, so a failure
# costs the full timeout here before we report it.
if oc wait --for=condition=complete job/${RUN_JOB} --timeout=2m; then
  echo "Job successful!"
else
  echo "Job ${RUN_JOB} did not complete successfully:"
  oc describe job/${RUN_JOB}
  exit 1
fi
