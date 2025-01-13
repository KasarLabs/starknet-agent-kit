<h1 align="center">
 <img src="https://pbs.twimg.com/profile_images/1834202903189618688/N4J8emeY_400x400.png" width="50"><br>
 starknet-agent-kit (alpha)
</h1>
<p align="center">
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

A NestJS-based toolkit for creating AI agents that can interact with the Starknet blockchain.

> ⚠️ **Warning**: This kit is currently under development. Please note that sharing sensitive information (private keys, personal data, etc.) with AI models involves inherent security risks.

## Getting Started

```bash
npm install @nestjs/common @nestjs/core @nestjs/platform-fastify starknet @langchain/anthropic
```

You will need two things:
- A Starknet wallet private key (you can get one from [Argent X](https://www.argent.xyz/argent-x))
- An AI provider API key (e.g., Anthropic, OpenAI)

### Basic Usage

```typescript
import { StarknetAgent } from 'starknet-agent-kit';

const agent = new StarknetAgent({
  aiProviderApiKey: process.env.AI_PROVIDER_API_KEY,
  aiProvider: process.env.AI_PROVIDER,
  aiModel: process.env.AI_MODEL,
  walletPrivateKey: process.env.STARKNET_PRIVATE_KEY,
});

// Execute commands in natural language
await agent.execute('transfer 0.1 ETH to 0x123...');

// Get balance
await agent.execute('What is my ETH balance?');

// Swap tokens
await agent.execute('Swap 5 USDC for ETH');

// Create account
await agent.execute('Create a new Argent account');
```

## Features
- Retrieve account infos (Balance, public key, etc)
- Create one or multiple accounts (Argent & OpenZeppelin)
- transfer assets between accounts
- Play with DeFi (Swap on Avnu)
- Play with dApps (Create a .stark domain)
- All RPC read methods supported (getBlockNumber, getStorageAt, etc.)

## Environment Variables

Create a `.env` file with the following variables:

```env
# Your Starknet wallet private key (required)
STARKNET_PRIVATE_KEY=""

# Your Starknet public address (required)
PUBLIC_ADDRESS=""

# Your AI provider API key for AI functionality (required)
# Get it from your AI provider's console
AI_PROVIDER_API_KEY=""

# The AI model to use (required)
# Example: "claude-3-opus-20240229"
AI_MODEL=""

# The AI provider to use (required)
# Example: "anthropic", "openai"
AI_PROVIDER=""

# Your Starknet RPC URL (required)
# You can use public endpoints or get a dedicated one from providers like Infura
RPC_URL=""

# Your custom API key for securing the endpoints (required)
# Generate a strong random string to protect your API endpoints
# This key must be included in the x-api-key header when making requests to your API
# You can generate a secure random string using these commands:
# - Linux/macOS: openssl rand -hex 32
# - Windows (PowerShell): -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
API_KEY=""
```

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/starknet-agent-kit.git
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`.

## API Endpoints

### POST /api/agent/request

Make requests to the Starknet agent.

Request body:
```json
{
  "request": "Your natural language request here"
}
```

Headers:
```
x-api-key: your_api_key
```

## Tools

All Langchain tools are available to be imported and used directly:

```typescript
import { getBalance, transfer, swapTokens } from 'starknet-agent-kit';
```

## Testing

To run tests:
```bash
npm run test
```

For E2E tests:
```bash
npm run test:e2e
```