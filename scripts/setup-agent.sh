#!/bin/bash

set -e

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

for cmd in git curl; do
    if ! command_exists $cmd; then
        echo -e "${RED}Error: $cmd is not installed. Please install $cmd first.${NC}"
        exit 1
    fi
done

if [ $# -eq 0 ]; then
    echo -e "${RED}Error: No config ID provided${NC}"
    echo "Usage: $0 <config_id>"
    exit 1
fi

CONFIG_ID="$1"
echo -e "${BLUE}Starting Starknet Agent Kit setup with config ID: $CONFIG_ID${NC}"

INSTALL_DIR="$HOME/.starknet-agent-kit"

if [ -d "$INSTALL_DIR" ]; then
    echo -e "${BLUE}Directory $INSTALL_DIR already exists, using existing installation...${NC}"
else
    echo -e "${BLUE}Creating installation directory...${NC}"
    mkdir -p "$INSTALL_DIR"

    echo -e "${BLUE}Cloning repository...${NC}"
    git clone https://github.com/kasarlabs/starknet-agent-kit.git "$INSTALL_DIR"
fi
echo -e "${GREEN}Repository has been successfully cloned to $INSTALL_DIR${NC}"

AGENT_CONFIG_DIR="$INSTALL_DIR/config/agents"

echo -e "${BLUE}Fetching agent configuration...${NC}"

if ! HTTP_RESPONSE=$(curl -s -w "\n%{http_code}" --connect-timeout 10 "http://starknetagent.ai/api/agents/$CONFIG_ID"); then
    echo -e "${RED}Error: Could not connect to the server. Please check your internet connection and try again.${NC}"
    exit 1
fi

if [ -z "$HTTP_RESPONSE" ] || ! echo "$HTTP_RESPONSE" | grep -q '^.*\n[0-9]\{3\}$'; then
    echo -e "${RED}Error: Invalid response from server${NC}"
    echo -e "${RED}Response: $HTTP_RESPONSE${NC}"
    exit 1
fi

HTTP_BODY=$(echo "$HTTP_RESPONSE" | sed -n '1p')
HTTP_STATUS=$(echo "$HTTP_RESPONSE" | sed -n '2p')

if [ -z "$HTTP_STATUS" ] || [ -z "$HTTP_BODY" ]; then
    echo -e "${RED}Error: Invalid response from server${NC}"
    exit 1
fi

if [ "$HTTP_STATUS" = "404" ]; then
    echo -e "${RED}Error: No configuration found with ID: $CONFIG_ID${NC}"
    exit 1
elif [ "$HTTP_STATUS" != "200" ]; then
    echo -e "${RED}Error: Failed to fetch configuration (Status: $HTTP_STATUS)${NC}"
    echo -e "${RED}Response: $HTTP_BODY${NC}"
    exit 1
fi



echo -e "${BLUE}Updating agent configuration...${NC}"

AGENT_NAME=$(echo "$HTTP_BODY" | grep -o '"name":[^,}]*' | sed 's/"name"://; s/"//g' | tr -d '[:space:]')

if [ -z "$AGENT_NAME" ]; then
    echo -e "${RED}Error: Could not extract agent name from configuration${NC}"
    exit 1
fi

CONFIG_FILE="$AGENT_CONFIG_DIR/$AGENT_NAME.agent.json"

if [ -f "$CONFIG_FILE" ]; then
    echo -e "${BLUE}A configuration file for '$AGENT_NAME' already exists.${NC}"
    read -p "Do you want to overwrite it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Setup cancelled.${NC}"
        exit 1
    fi
fi

echo "$HTTP_BODY" > "$CONFIG_FILE"

echo -e "${GREEN}Configuration has been successfully saved to $CONFIG_FILE${NC}"

echo -e "${BLUE}Changing to installation directory...${NC}"
cd "$INSTALL_DIR"

echo -e "${BLUE}Installing dependencies...${NC}"
pnpm install

echo -e "${BLUE}Starting the agent...${NC}"
pnpm run local --agent=$CONFIG_FILE
