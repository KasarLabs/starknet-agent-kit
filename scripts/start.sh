#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if the dist directory exists
if [ ! -d "dist" ] || [ ! -d "client/.next" ]; then
    echo -e "${BLUE}Building project...${NC}"
    pnpm build
fi

# Check if --frontend-only or --backend-only flag is passed
if [ "$1" == "--frontend-only" ]; then
    echo -e "${BLUE}Starting frontend production server...${NC}"
    cd client && pnpm start
elif [ "$1" == "--backend-only" ]; then
    echo -e "${BLUE}Starting backend production server...${NC}"
    pnpm start:backend
else
    echo -e "${BLUE}Starting production servers...${NC}"
    pnpm start
fi

# Handle errors
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Production server failed to start${NC}"
    exit 1
fi