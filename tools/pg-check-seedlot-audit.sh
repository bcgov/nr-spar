#!/bin/bash
# -*- coding: utf-8 -*-

CONTAINER_ID="efa380b99500"
DB_USER="postgres"
DB_NAME="spar"

__SEEDLOT_QUERY="
SELECT c.column_name
FROM information_schema.columns c
WHERE c.table_schema = '$DB_NAME'
  AND c.table_name = 'seedlot'
"

__SEEDLOT_AUDIT_QUERY="
SELECT c.column_name
FROM information_schema.columns c
WHERE c.table_schema = '$DB_NAME'
  AND table_name = 'seedlot_audit'
  AND c.column_name NOT IN (
    'audit_date',
    'audit_revision_version',
    'db_user',
    'seedlot_audit_id',
    'spar_audit_code'
  )
"

# Get Seedlot columns
docker exec $CONTAINER_ID \
  psql -q -t -U $DB_USER -d $DB_NAME \
  -c "$__SEEDLOT_QUERY" | sort > /tmp/seedlot_check.txt

# Get Seedlot Audit columns
docker exec $CONTAINER_ID \
  psql -q -t -U $DB_USER -d $DB_NAME \
  -c "$__SEEDLOT_AUDIT_QUERY" | sort > /tmp/seedlot_audit_check.txt

DIFF=$(diff /tmp/seedlot_check.txt /tmp/seedlot_audit_check.txt)
if [ "$DIFF" == "" ]; then
  echo "All good!"
else
  echo "Ooopss. You better check. Differences has been found!"
  echo $DIFF
fi
