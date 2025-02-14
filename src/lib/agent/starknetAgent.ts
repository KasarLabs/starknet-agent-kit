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
} from './plugins/Twitter/interface/twitter-interface';
import { JsonConfig } from './jsonConfig';

export interface StarknetAgentConfig {
  aiProviderApiKey: string;
  aiModel: string;
  aiProvider: string;
  provider: RpcProvider;
  network: string;
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
  private readonly agentReactExecutor: any;
  private twitterAccoutManager: TwitterInterface = {};

  public readonly accountManager: AccountManager;
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
    if (this.agentMode === 'auto') {
      this.agentReactExecutor = createAutonomousAgent(this, {
        aiModel: this.aiModel,
        apiKey: this.aiProviderApiKey,
        aiProvider: config.aiProvider,
      });
    }
    if (this.agentMode === 'agent') {
      this.agentReactExecutor = createAgent(this, {
        aiModel: this.aiModel,
        apiKey: this.aiProviderApiKey,
        aiProvider: config.aiProvider,
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

  public async initializeTwitterManager(): Promise<void> {
    const auth_mode = process.env.TWITTER_AUTH_MODE;
    try {
      if (auth_mode === 'CREDIDENTIALS') {
        const username = process.env.TWITTER_USERNAME;
        const password = process.env.TWITTER_PASSWORD;
        const email = process.env.TWITTER_EMAIL;

        if (!username || !password) {
          throw new Error(
            'Error when try to initializeTwitterManager in CREDIDENTIALS twitter_auth_mode check your .env'
          );
        }
        const user_client = new Scraper();

        await user_client.login(username, password, email);
        const account = await user_client.me();
        if (!account) {
          throw new Error('Impossible to get your twitter account information');
        }
        const userClient: TwitterScraperConfig = {
          twitter_client: user_client,
          twitter_id: account?.userId as string,
          twitter_username: account?.username as string,
        };
        this.twitterAccoutManager.twitter_scraper = userClient;
      } else if (auth_mode === 'API') {
        const twitter_api = process.env.TWITTER_API;
        const twitter_api_secret = process.env.TWITTER_API_SECRET;
        const twitter_access_token = process.env.TWITTER_ACCESS_TOKEN;
        const twitter_access_token_secret =
          process.env.TWITTER_ACCESS_TOKEN_SECRET;

        if (
          !twitter_api ||
          !twitter_api_secret ||
          !twitter_access_token ||
          !twitter_access_token_secret
        ) {
          throw new Error(
            'Error when try to initializeTwitterManager in API twitter_auth_mode check your .env'
          );
        }

        const userClient = new TwitterApi({
          appKey: twitter_api,
          appSecret: twitter_api_secret,
          accessToken: twitter_access_token,
          accessSecret: twitter_access_token_secret,
        });
        if (!userClient) {
          throw new Error(
            'Error when trying to createn you Twitter API Account check your API Twitter Credidentials'
          );
        }

        const apiConfig: TwitterApiConfig = {
          twitter_api: twitter_api,
          twitter_api_secret: twitter_api_secret,
          twitter_access_token: twitter_access_token,
          twitter_access_token_secret: twitter_access_token_secret,
          twitter_api_client: userClient,
        };

        this.twitterAccoutManager.twitter_api = apiConfig;
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
      return;
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

  getNetwork(): string {
    return this.config.network;
  }

  getLimit(): Limit {
    return this.token_limit;
  }

  getTwitterAuthMode(): 'API' | 'CREDIDENTIALS' | undefined {
    return process.env.TWITTER_AUTH_MODE as 'API' | 'CREDIDENTIALS' | undefined;
  }

  getTwitterManager(): TwitterInterface {
    if (!this.twitterAccoutManager) {
      throw new Error(
        'Twitter manager not initialized. Call initializeTwitterManager() first'
      );
    }
    return this.twitterAccoutManager;
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
