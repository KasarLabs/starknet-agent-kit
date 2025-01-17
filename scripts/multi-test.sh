#!/bin/bash

ITERATIONS=${1:-10}
LOG_FILE="test-results.log"

> "$LOG_FILE"

echo "Running tests $ITERATIONS times..."

for i in $(seq 1 $ITERATIONS); do
    echo "Run $i - $(date '+%H:%M:%S')" >> "$LOG_FILE"
    npx jest >> "$LOG_FILE" 2>&1
    echo "" >> "$LOG_FILE"
done

FAIL_COUNT=$(grep -c "✕" "$LOG_FILE")

echo "----------------------------------------" >> "$LOG_FILE"
echo "Total failed tests: $FAIL_COUNT" >> "$LOG_FILE"
echo "Tests executed $ITERATIONS times" >> "$LOG_FILE"

echo "----------------------------------------"
echo "Total failed tests: $FAIL_COUNT"
echo "Tests executed $ITERATIONS times"