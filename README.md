starknet-agent-kit (alpha)

🚀 A cutting-edge AI-powered agent toolkit for Starknet blockchain.

🔹 AI-integrated automation for blockchain interactions.
🔹 Plug-and-play NestJS server with a user-friendly web interface.
🔹 Multi-provider support: Anthropic, OpenAI, Google Gemini, and Ollama.

🌟 Why Use This Kit?

Boost productivity with automated AI interactions.

Enhance security with private key management.

Seamlessly integrate AI into your Starknet applications.

🚀 Quick Start

Prerequisites

✅ Starknet Wallet (Argent X recommended)

✅ AI Provider API Key (Anthropic, OpenAI, Google Gemini, Ollama)

✅ Node.js & pnpm installed

Installation

git clone https://github.com/kasarlabs/starknet-agent-kit.git
cd starknet-agent-kit
pnpm install

Configuration

Create a .env file with the required settings:

STARKNET_PUBLIC_ADDRESS="YOUR_STARKNET_PUBLIC_ADDRESS"
STARKNET_PRIVATE_KEY="YOUR_STARKNET_PRIVATE_KEY"
STARKNET_RPC_URL="YOUR_STARKNET_RPC_URL"

AI_PROVIDER_API_KEY="YOUR_AI_PROVIDER_API_KEY"
AI_MODEL="YOUR_AI_MODEL"
AI_PROVIDER="YOUR_AI_PROVIDER"

SERVER_API_KEY="YOUR_SERVER_API_KEY"
SERVER_PORT="YOUR_SERVER_PORT"

⚙️ Usage

Server Mode

Launch the server:

pnpm run local

Modes:

Chat Mode 🤖 - Interact with your AI-powered agent.

Check balances

Execute transfers

Manage accounts

Autonomous Mode 🛠️ - Automated monitoring & alerts.
Configure config/agents/config-agent.json:

{
  "name": "MyAgent",
  "context": "You are a Starknet monitoring agent...",
  "interval": 60000,
  "chat_id": "your_discord_channel_id",
  "allowed_actions": ["get_balance", "get_block_number"],
  "prompt": "Monitor ETH balance and alert if it drops below 1 ETH..."
}

Library Mode

Use the toolkit in your TypeScript project:

import { StarknetAgent } from 'starknet-agent-kit';

const agent = new StarknetAgent({
  provider: new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL }),
  accountPrivateKey: process.env.STARKNET_PRIVATE_KEY,
  accountPublicKey: process.env.STARKNET_PUBLIC_ADDRESS,
  aiModel: process.env.AI_MODEL,
  aiProvider: process.env.AI_PROVIDER,
  aiProviderApiKey: process.env.AI_PROVIDER_API_KEY,
  signature: 'key',
});

const response = await agent.execute("What's my ETH balance?");

📚 More Features & Actions

🔍 Explore available actions in our documentation.🛠️ Add custom actions by following our step-by-step guide.

👥 Contribute & Join the Community

💡 Ideas? Bugs? We welcome contributions! Submit a Pull Request or open an Issue.🚀 Follow @kasarlabs for updates!

📜 License

MIT License - see the LICENSE file for details.

🔥 Made by developers, for developers. If you like this project, give it a ⭐ on GitHub!
