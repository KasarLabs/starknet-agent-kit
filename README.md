<div align="center">
<img src="https://pbs.twimg.com/profile_images/1834202903189618688/N4J8emeY_400x400.png" width="50" alt="Starknet Agent Kit Logo">

**starknet-agent-kit (alpha)**

<p>
<a href="https://www.npmjs.com/package/starknet-agent-kit">
<img src="https://img.shields.io/npm/v/starknet-agent-kit.svg" alt="NPM Version" />
</a>
<a href="https://github.com/kasarlabs/starknet-agent-kit/blob/main/LICENSE">
<img src="https://img.shields.io/npm/l/starknet-agent-kit.svg" alt="License" />
</a>
<a href="https://github.com/kasarlabs/starknet-agent-kit/stargazers">
<img src="https://img.shields.io/github/stars/kasarlabs/starknet-agent-kit.svg" alt="GitHub Stars" />
</a>
<a href="https://nodejs.org">
<img src="https://img.shields.io/node/v/starknet-agent-kit.svg" alt="Node Version" />
</a>
</p>
</div>

A toolkit for creating AI agents that can interact with the Starknet blockchain, available both as an NPM package and a ready-to-use NestJS server with a web interface.

> ⚠️ **Warning**: This kit is currently under development. Use it at your own risk! Please be aware that sharing sensitive information such as private keys, personal data, or confidential details with AI models or tools carries inherent security risks. The contributors of this repository are **not responsible** for any loss, damage, or issues arising from its use.

## Prerequisites

Before starting, you'll need:

- A Starknet wallet (get one from [Argent X](https://www.argent.xyz/argent-x))
- An AI provider API key (supports Anthropic, OpenAI, Google Gemini, or Ollama)
- Node.js and pnpm installed

## Quick Start

1. Clone and install:
```bash
git clone https://github.com/kasarlabs/starknet-agent-kit.git
cd starknet-agent-kit
pnpm install
```

2. Create a `.env` file:
```env
# Required Configuration
PRIVATE_KEY="your_wallet_private_key"
PUBLIC_ADDRESS="your_wallet_address"
RPC_URL="your_rpc_endpoint"
AI_PROVIDER_API_KEY="your_ai_api_key"
AI_PROVIDER="anthropic"  # or "openai", "gemini", "ollama"
AI_MODEL="claude-3-5-sonnet-latest"  # or your chosen model
API_KEY="your_api_key_for_endpoints"
```

## Running the Agent

Launch the agent using:

```bash
pnpm run local
```

You'll be presented with two modes to choose from:

### 1. Chat Mode

Interactive mode where you can have a conversation with the agent. Example commands:
- "What's my ETH balance?"
- "Transfer 0.1 ETH to 0x123..."
- "Create a new Argent account"
- "Get the latest block number"

### 2. Autonomous Mode

Requires a config file at `config/agents/config-agent.json`:

```json
{
  "name": "MyAgent",
  "context": "You are a Starknet monitoring agent...",
  "interval": 60000,
  "chat_id": "your_discord_channel_id",
  "allowed_tools": [
    "get_balance",
    "get_block_number"
    // Add other required tools
  ],
  "prompt": "Monitor ETH balance and alert if it drops below 1 ETH..."
}
```

The agent will run continuously according to your configuration, executing tasks and sending notifications through Discord.

## Available Tools

The agent supports various operations including:
- Account management (balance checks, transfers)
- DeFi operations (Avnu swaps)
- Contract interactions
- Blockchain queries (RPC read methods)

## Web Integration

To integrate the agent in your web application:

```typescript
import { StarknetAgent } from 'starknet-agent-kit';

// Initialize agent
const agent = new StarknetAgent({
  provider: new RpcProvider({ nodeUrl: process.env.RPC_URL }),
  accountPrivateKey: process.env.PRIVATE_KEY,
  accountPublicKey: process.env.PUBLIC_ADDRESS,
  aiModel: process.env.AI_MODEL,
  aiProvider: process.env.AI_PROVIDER,
  aiProviderApiKey: process.env.AI_PROVIDER_API_KEY,
  signature: 'key',  // Use 'key' for backend execution or 'wallet' for frontend
  agentMode: 'agent'  // Use 'agent' for chat or 'auto' for autonomous
});

// Execute commands
const response = await agent.execute("What's my ETH balance?");
```

## Development

```bash
# Run tests
pnpm test
```

## Security Note

Never share private keys or sensitive data through the agent interface. The agent should only have access to wallets specifically created for automation purposes.

## Features

- Retrieve account information (Balance, public key, etc.)
- Create one or multiple accounts (Argent & OpenZeppelin)
- Transfer assets between accounts
- DeFi operations (Swap on Avnu)
- dApp interactions (Create a .stark domain)
- All RPC read methods supported (getBlockNumber, getStorageAt, etc.)
- Web interface for easy interaction
- Full API server implementation

## Installation

### As an NPM Package

```bash
npm install starknet-agent-kit
```

Required peer dependencies:

```bash
npm install @nestjs/common @nestjs/core @nestjs/platform-fastify starknet @langchain/anthropic
```

### Running the Full Stack (Server + Web Interface)

1. Clone the repository:

```bash
git clone https://github.com/kasarlabs/starknet-agent-kit.git
cd starknet-agent-kit
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the setup script:

```bash
pnpm run setup
```

This will install all dependencies and build both the backend and frontend.

## Prerequisites

You will need:

- A Starknet wallet private key (you can get one from [Argent X](https://www.argent.xyz/argent-x))
- An AI provider API key (supported providers: Anthropic, OpenAI, Google (Gemini), Ollama)

## Usage

### As an NPM Package

You can initialize the StarknetAgent in two different ways:

1. Key-Based Initialization
   This approach allows the use of an account integrated into the .env file.
   It provides access to all the tools and outputs formatted by the chosen AI provider, as all transactions are executed on the backend.

2. Wallet-Based Initialization
   This approach eliminates the need to store account credentials in the .env file.
   However, the number of tools available is limited. The outputs are formatted in JSON and are intended to be executed on a client, for instance, using .execute from Account or WalletAccount in starknet.js

#### 1. Key Initialization

```typescript
import { StarknetAgent } from 'starknet-agent-kit';

const agent = new StarknetAgent({
  aiProviderApiKey: 'your-ai-provider-key',
  aiProvider: 'anthropic', // or 'openai', 'gemini', 'ollama'
  aiModel: 'claude-3-5-sonnet-latest',
  accountPrivateKey: 'your-wallet-private-key',
  rpcUrl: 'your-rpc-url',
  signature: 'key',
});

// Execute commands in natural language
await agent.execute('transfer 0.1 ETH to 0x123...');
await agent.execute('What is my ETH balance?');
await agent.execute('Swap 5 USDC for ETH');
```

#### 2. Wallet Initialization

```typescript
import { StarknetAgent } from 'starknet-agent-kit';

const agent = new StarknetAgent({
  aiProviderApiKey: 'your-ai-provider-key',
  aiProvider: 'anthropic', // or 'openai', 'gemini', 'ollama'
  aiModel: 'claude-3-5-sonnet-latest',
  accountPrivateKey: 'your-wallet-private-key',
  rpcUrl: 'your-rpc-url',
  signature: 'wallet',
});

// Execute commands in natural language
await agent.execute_signature('transfer 0.1 ETH to 0x123...');
await agent.execute_signature('What is my ETH balance?');
await agent.execute_signature('Create and deploy Argent account');
```

#### 1. Using Key Initialization in a Client

```typescript
  const input = "Transfer 0.13 ETH to 0.123..."

  const response = await fetch('/api/key/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify({ request: input }),
        credentials: 'include',
  })
  /* The response contain the 'output' created by the your AI
    ex : 'output' : your transfer of 0,123 ETH to 0x123.. is successfull you can check the tx at
        https://voyager...
```

#### 2. Using Wallet Initialization in a Client

- You will need an WalletAccount class Implementation with get-starknet.js : https://starknetjs.com/docs/next/guides/walletAccount.
- You can also use Account class from starknet.js : https://starknetjs.com/docs/next/guides/create_account

For this example i am using Account. You can check our repository for a WalletAccount class integration

```typescript
const provider = new RPCprovider({ nodeUrl: 'Your RPC_URL' });
const account = new Account(provider, 'your_public_key', 'your_private_key');

const response = await fetch('/api/wallet/request', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
  },
  body: JSON.stringify({ request: 'transfer 0.0001 ETH to 0x123' }),
  credentials: 'include',
});

const result = response.json();
const transaction_object = result.getTransaction(); // You need to parse the json to get the transaction object

const transaction_hash = await account.exectute(transaction_object);
```

### Mode Configuration

| Mode   | Description                                                                                                          |
| ------ | -------------------------------------------------------------------------------------------------------------------- |
| Key    | Uses environment variables from .env file to configure account credentials and tool settings.                        |
| Wallet | Return a JSON response that needs to be executed on the front-end using WalletAccount or Account from 'starknet.js'. |

### Using Individual Tools

All Langchain tools are available for direct import:

```typescript
import { getBalance, transfer, swapTokens } from 'starknet-agent-kit';

// Use tools individually
const balance = await getBalance(address);
```

### Running the Full Stack

#### Configuration

Create a `.env` file:

```env
# Required for both package and server
PRIVATE_KEY=""
PUBLIC_ADDRESS=""
AI_PROVIDER_API_KEY=""
AI_MODEL=""  # e.g., "claude-3-5-sonnet-latest"
AI_PROVIDER=""  # "anthropic", "openai", "gemini", or "ollama"
RPC_URL=""

# Required only for server
API_KEY=""  # Security key for API endpoints
PORT=3001  # Optional, defaults to 3000
```

#### Development Mode

```bash
# Install dependencies first (if not done already)
pnpm install

# Start both frontend and backend
pnpm run dev

# Start only frontend
pnpm run dev --frontend-only

# Start only backend
pnpm run dev --backend-only
```

#### Production Mode

```bash
# Install dependencies first (if not done already)
pnpm install

# Start both frontend and backend
pnpm run start

# Start only frontend
pnpm run start --frontend-only

# Start only backend
pnpm run start --backend-only
```

### Server API Endpoints

#### Make Agent Requests

```bash
curl --location 'localhost:3001/api/agent/request' \
--header 'x-api-key: your-api-key' \
--header 'Content-Type: application/json' \
--data '{
    "request": "What's my ETH balance?"
}'
```

## Testing

```bash
# Run unit tests
pnpm test

# Run frontend tests
pnpm test:frontend

# Run end-to-end tests
pnpm test:e2e
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
