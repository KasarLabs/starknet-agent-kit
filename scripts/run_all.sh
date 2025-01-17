#!/bin/bash
DEVNET_PORT=5050
DEVNET_SEED=42
DEVNET_ACCOUNTS=3
DEVNET_ACCOUNT_CLASS='cairo1'
DEVNET_INITIAL_BALANCE='10000000000000000000000'
FORK_NETWORK='https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/Xj-rCxxzGcBnS3HwqOnBqO8TMa8NRGky'

if ! command -v starknet-devnet &> /dev/null; then
    echo "❌ starknet-devnet not installed"
    exit 1
fi

launch_server() {
    echo "🚀 Starting starknet-devnet..."
    starknet-devnet \
        --fork-network "$FORK_NETWORK" \
        --port "$DEVNET_PORT" \
        --seed "$DEVNET_SEED" \
        --accounts "$DEVNET_ACCOUNTS" \
        --account-class "$DEVNET_ACCOUNT_CLASS" \
        --initial-balance "$DEVNET_INITIAL_BALANCE"
}

run_tests() {
    local iterations=${1:-10}
    local log_file="test-results.log"
    
    echo "⏳ Waiting 4 seconds for server startup..."
    sleep 4
    
    > "$log_file"
    echo "🧪 Running tests $iterations times..."
    
    for i in $(seq 1 "$iterations"); do
        echo "🔄 Run $i - $(date '+%H:%M:%S')" >> "$log_file"
        npx jest >> "$log_file" 2>&1
        echo "" >> "$log_file"
    done
    
    FAIL_COUNT=$(grep -c "✕" "$log_file")
    
    echo "📊 ----------------------------------------" >> "$log_file"
    echo "❗ Total failed tests: $FAIL_COUNT" >> "$log_file"
    echo "✅ Tests executed $iterations times" >> "$log_file"
    
    echo "📊 ----------------------------------------"
    echo "❗ Total failed tests: $FAIL_COUNT"
    echo "✅ Tests executed $iterations times"
}

ITERATIONS=${1:-10}

launch_server &
SERVER_PID=$!

run_tests "$ITERATIONS"

trap 'kill $SERVER_PID' EXIT