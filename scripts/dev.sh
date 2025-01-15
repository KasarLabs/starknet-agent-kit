#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if --frontend-only or --backend-only flag is passed
if [ "$1" == "--frontend-only" ]; then
    echo -e "${BLUE}Starting frontend development server...${NC}"
    cd client && pnpm dev
elif [ "$1" == "--backend-only" ]; then
    echo -e "${BLUE}Starting backend development server...${NC}"
    pnpm dev:backend
else
    echo -e "${BLUE}Starting development servers...${NC}"
    pnpm dev
fi

# Handle errors
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Development server failed to start${NC}"
    exit 1
fi