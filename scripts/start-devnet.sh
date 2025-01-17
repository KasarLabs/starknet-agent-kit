#!/bin/bash

# Configuration starknet-devnet
DEVNET_PORT=5050
DEVNET_SEED=42
DEVNET_ACCOUNTS=3
DEVNET_ACCOUNT_CLASS='cairo1'
DEVNET_INITIAL_BALANCE='10000000000000000000000'
FORK_NETWORK='https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/Xj-rCxxzGcBnS3HwqOnBqO8TMa8NRGky'
# Vérification que starknet-devnet est installé
if ! command -v starknet-devnet &> /dev/null; then
    echo "❌ starknet-devnet n'est pas installé"
    exit 1
fi

echo "🚀 Démarrage de starknet-devnet..."
starknet-devnet \
    --fork-network $FORK_NETWORK \
    --port $DEVNET_PORT \
    --seed $DEVNET_SEED \
    --accounts $DEVNET_ACCOUNTS \
    --account-class $DEVNET_ACCOUNT_CLASS \
    --initial-balance $DEVNET_INITIAL_BALANCE