import { IAgent } from '../../agents/interfaces/agent.interface';
import { createAgent } from './agent';
import { RpcProvider } from 'starknet';
import { AccountManager } from './plugins/core/account/utils/AccountManager';
import { TransactionMonitor } from './plugins/core/transaction/utils/TransactionMonitor';
import { ContractInteractor } from './plugins/core/contract/utils/ContractInteractor';
import { createAutonomousAgent } from './autonomousAgents';
import { AddAgentLimit, Limit } from './limit';
import { Scraper } from 'agent-twitter-client';
import { TwitterApi } from 'twitter-api-v2';
import {
  TwitterInterface,
  TwitterApiConfig,
  TwitterScraperConfig,
} from './plugins/twitter/interfaces';
import { JsonConfig } from './jsonConfig';
import { PluginManager } from './tools/tools';

export interface StarknetAgentConfig {
  aiProviderApiKey: string;
  aiModel: string;
  aiProvider: string;
  provider: RpcProvider;
  accountPublicKey: string;
  accountPrivateKey: string;
  signature: string;
  agentMode: string;
  agentconfig?: JsonConfig;
}

export class StarknetAgent implements IAgent {
  private readonly provider: RpcProvider;
  private readonly accountPrivateKey: string;
  private readonly accountPublicKey: string;
  private readonly aiModel: string;
  private readonly aiProviderApiKey: string;
  private agentReactExecutor: any;

  public readonly accountManager: AccountManager;
  public readonly plugins_manager: PluginManager = {};
  public readonly transactionMonitor: TransactionMonitor;
  public readonly contractInteractor: ContractInteractor;
  public readonly signature: string;
  public readonly agentMode: string;
  public readonly token_limit: Limit;
  public readonly agentconfig?: JsonConfig | undefined;

  constructor(private readonly config: StarknetAgentConfig) {
    this.validateConfig(config);

    this.provider = config.provider;
    this.accountPrivateKey = config.accountPrivateKey;
    this.accountPublicKey = config.accountPublicKey;
    this.aiModel = config.aiModel;
    this.aiProviderApiKey = config.aiProviderApiKey;
    this.signature = config.signature;
    this.agentMode = config.agentMode;
    this.agentconfig = config.agentconfig;

    this.token_limit = AddAgentLimit();

    // Initialize managers
    this.accountManager = new AccountManager(this.provider);
    this.transactionMonitor = new TransactionMonitor(this.provider);
    this.contractInteractor = new ContractInteractor(this.provider);

    // Create agent executor with tools
  }

  public async createAgentReactExecutor() {
    if (this.agentMode === 'auto') {
      this.agentReactExecutor = await createAutonomousAgent(this, {
        aiModel: this.aiModel,
        apiKey: this.aiProviderApiKey,
        aiProvider: this.config.aiProvider,
      });
    }
    if (this.agentMode === 'agent') {
      this.agentReactExecutor = await createAgent(this, {
        aiModel: this.aiModel,
        apiKey: this.aiProviderApiKey,
        aiProvider: this.config.aiProvider,
      });
    }
  }
  private validateConfig(config: StarknetAgentConfig) {
    if (!config.accountPrivateKey) {
      throw new Error(
        'Starknet wallet private key is required https://www.argent.xyz/argent-x'
      );
    }
    if (config.aiModel !== 'ollama' && !config.aiProviderApiKey) {
      throw new Error('AI Provider API key is required');
    }
  }

  getAccountCredentials() {
    return {
      accountPrivateKey: this.accountPrivateKey,
      accountPublicKey: this.accountPublicKey,
    };
  }

  getModelCredentials() {
    return {
      aiModel: this.aiModel,
      aiProviderApiKey: this.aiProviderApiKey,
    };
  }

  getSignature() {
    return {
      signature: this.signature,
    };
  }

  getAgent() {
    return {
      agentMode: this.agentMode,
    };
  }

  getAgentConfig(): JsonConfig | undefined {
    return this.agentconfig;
  }
  getProvider(): RpcProvider {
    return this.provider;
  }

  getLimit(): Limit {
    return this.token_limit;
  }

  async validateRequest(request: string): Promise<boolean> {
    return Boolean(request && typeof request === 'string');
  }

  async execute_autonomous(): Promise<unknown> {
    while (-1) {
      const aiMessage = await this.agentReactExecutor.agent.invoke(
        {
          messages: 'Choose what to do',
        },
        this.agentReactExecutor.agentConfig
      );
      console.log(aiMessage.messages[aiMessage.messages.length - 1].content);
      await new Promise((resolve) =>
        setTimeout(resolve, this.agentReactExecutor.json_config.interval)
      );
    }
    return;
  }

  async execute(input: string): Promise<unknown> {
    if (this.agentMode != 'agent') {
      throw new Error(
        `Can't use execute call data with agent_mod : ${this.agentMode}`
      );
    }
    const aiMessage = await this.agentReactExecutor.invoke({ messages: input });
    return aiMessage.messages[aiMessage.messages.length - 1].content;
  }

  async execute_call_data(input: string): Promise<unknown> {
    if (this.agentMode != 'agent') {
      throw new Error(
        `Can't use execute call data with agent_mod : ${this.agentMode}`
      );
    }
    const aiMessage = await this.agentReactExecutor.invoke({ messages: input });
    try {
      const parsedResult = JSON.parse(
        aiMessage.messages[aiMessage.messages.length - 2].content
      );
      return parsedResult;
    } catch (parseError) {
      return {
        status: 'failure',
        error: `Failed to parse observation: ${parseError.message}`,
      };
    }
  }
}
