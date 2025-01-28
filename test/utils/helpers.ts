import { StarknetAgent } from "src/lib/agent/starknetAgent";
import { StarknetAgentInterface } from "src/lib/agent/tools";
import { RpcProvider } from "starknet";
import { invalid_private_key } from "./constant";

interface Account {
  agent?: StarknetAgentInterface;
  publicAddress: string;
  privateKey:string
}

interface TestAccounts {
  account1: Account;
  account2: Account;
  account3: Account;
}

interface EnvConfig {
  RPC_URL: string;
  accounts: TestAccounts;
}

export const loadTestConfig = (): EnvConfig => {
  const config: EnvConfig = {
    RPC_URL: 'localhost:5050',
    accounts: {
      account1: {
        privateKey:
          '0x00000000000000000000000000000000b137668388dbe9acdfa3bc734cc2c469',
        publicAddress:
          '0x034ba56f92265f0868c57d3fe72ecab144fc96f97954bbbc4252cef8e8a979ba',
      },
      account2: {
        privateKey:
          '0x00000000000000000000000000000000e8c2801d899646311100a661d32587aa',
        publicAddress:
          '0x02939f2dc3f80cc7d620e8a86f2e69c1e187b7ff44b74056647368b5c49dc370',
      },
      account3: {
        privateKey:
          '0x000000000000000000000000000000007b2e5d0e627be6ce12ddc6fd0f5ff2fb',
        publicAddress:
          '0x025a6c9f0c15ef30c139065096b4b8e563e6b86191fd600a4f0616df8f22fb77',
      },
    },
  };

  return config;
};

export let globalAgent: StarknetAgent;
export let agent1: StarknetAgent;
export let agent2: StarknetAgent;
export let agent3: StarknetAgent;
export let invalidAgent: StarknetAgent;

export const initializeGlobalAgent = () => {
  if (!globalAgent) {
    globalAgent = new StarknetAgent({
      provider: defaultConfig.starknet.provider,
      accountPrivateKey: defaultConfig.starknet.privateKey,
      accountPublicKey: defaultConfig.starknet.publicKey,
      aiModel: defaultConfig.ai.model,
      aiProvider: defaultConfig.ai.provider as 'anthropic' | 'openai' | 'ollama' | 'gemini',
      aiProviderApiKey: defaultConfig.ai.apiKey,
    });
  }
  return globalAgent;
};

//setup default config
export const defaultConfig = {
  starknet: {
    provider: new RpcProvider({
      nodeUrl: "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/Xj-rCxxzGcBnS3HwqOnBqO8TMa8NRGky"
    }),
    privateKey: "",
    publicKey: "",
  },
  ai: {
    model: "",
    provider: '',
    apiKey: "",
  },
};

export const createCustomAgent = (config: {
  provider?: RpcProvider;
  privateKey?: string;
  publicKey?: string;
  aiModel?: string;
  aiProvider?: 'anthropic' | 'openai' | 'ollama' | 'gemini';
  apiKey?: string;
} = {}) => {
  return new StarknetAgent({
    provider: config.provider || defaultConfig.starknet.provider,
    accountPrivateKey: config.privateKey || defaultConfig.starknet.privateKey,
    accountPublicKey: config.publicKey || defaultConfig.starknet.publicKey,
    aiModel: config.aiModel || defaultConfig.ai.model,
    aiProvider: (config.aiProvider || defaultConfig.ai.provider) as 'anthropic',
    aiProviderApiKey: config.apiKey || defaultConfig.ai.apiKey,
  });
};

export const setupTestEnvironment = () => {
  const config = loadTestConfig();
  
  globalAgent = createCustomAgent({})
  
  agent1 = createCustomAgent({
    provider: new RpcProvider({nodeUrl:config.RPC_URL}),
    privateKey:config.accounts.account1.privateKey,
    publicKey: config.accounts.account1.privateKey
  });
  
  agent2 = createCustomAgent({
    provider: new RpcProvider({nodeUrl:config.RPC_URL}),
    privateKey:config.accounts.account2.privateKey,
    publicKey: config.accounts.account2.privateKey
  });
  
  agent3 = createCustomAgent({
    provider: new RpcProvider({nodeUrl:config.RPC_URL}),
    privateKey:config.accounts.account3.privateKey,
    publicKey: config.accounts.account3.privateKey
  });

  invalidAgent = createCustomAgent({
    privateKey: invalid_private_key
  })

};
