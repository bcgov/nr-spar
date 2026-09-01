#!/bin/bash
# scripts/compare-test-time.sh

SPEC_NAME=$1
FEATURE_FILE="cypress/e2e/features/${SPEC_NAME}.feature"
LEGACY_FILE="cypress/e2e/smoke-test-01/${SPEC_NAME}.cy.ts"

if [ ! -f "$FEATURE_FILE" ] || [ ! -f "$LEGACY_FILE" ]; then
  echo "❌ Files not found. Check paths:"
  echo "   Feature: $FEATURE_FILE"
  echo "   Legacy:  $LEGACY_FILE"
  exit 1
fi

echo "⏱️  Measuring: $SPEC_NAME"
echo "═══════════════════════════════"

# Run legacy test
echo "Running legacy test..."
LEGACY_START=$(date +%s%N)
npx cypress run --spec "$LEGACY_FILE" --headless > /dev/null 2>&1
LEGACY_END=$(date +%s%N)
LEGACY_TIME=$(( ($LEGACY_END - $LEGACY_START) / 1000000 ))

# Run feature test
echo "Running feature test..."
FEATURE_START=$(date +%s%N)
npx cypress run --spec "$FEATURE_FILE" --headless > /dev/null 2>&1
FEATURE_END=$(date +%s%N)
FEATURE_TIME=$(( ($FEATURE_END - $FEATURE_START) / 1000000 ))

# Calculate savings
LEGACY_SEC=$(awk -v ms="$LEGACY_TIME" 'BEGIN { printf "%.2f", ms/1000 }')
FEATURE_SEC=$(awk -v ms="$FEATURE_TIME" 'BEGIN { printf "%.2f", ms/1000 }')
SAVED=$(awk -v l="$LEGACY_SEC" -v f="$FEATURE_SEC" 'BEGIN { printf "%.2f", l-f }')
PERCENT=$(awk -v s="$SAVED" -v l="$LEGACY_SEC" 'BEGIN { if (l==0) printf "0.0"; else printf "%.1f", (s/l)*100 }')

echo ""
echo "Legacy test:  ${LEGACY_SEC}s"
echo "Feature test: ${FEATURE_SEC}s"
echo "Time saved:   ${SAVED}s (${PERCENT}%)"
echo ""

if awk -v s="$SAVED" 'BEGIN { exit !(s > 0) }'; then
  echo "Feature test is $PERCENT% faster!"
else
  NEG_PERCENT=$(awk -v p="$PERCENT" 'BEGIN { printf "%.1f", -1*p }')
  echo "Feature test is ${NEG_PERCENT}% slower"
fi

if [ -z "$SPEC_NAME" ]; then
echo "Usage: bash cypress/scripts/compare-test-time.sh <spec-name>"
exit 1
fi
