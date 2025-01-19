import { IAgent } from '../../agents/interfaces/agent.interface';
import type { AgentExecutor } from 'langchain/agents';
import { createAgent } from './agent';
import { RpcProvider } from 'starknet';
import { RPC_URL } from '../utils/constants/constant';
import { AccountManager } from '../utils/account/AccountManager';
import { TransactionMonitor } from '../utils/monitoring/TransactionMonitor';
import { ContractInteractor } from '../utils/contract/ContractInteractor';

export const rpcProvider = new RpcProvider({ nodeUrl: RPC_URL });

export interface StarknetAgentConfig {
  aiProviderApiKey: string;
  accountPrivateKey: string;
  aiModel: string;
  aiProvider: 'openai' | 'anthropic' | 'ollama' | 'gemini';
  provider: RpcProvider;
  accountPublicKey: string;
}

export class StarknetAgent implements IAgent {
  private readonly provider: RpcProvider;
  private readonly accountPrivateKey: string;
  private readonly accountPublicKey: string;
  private readonly aiModel: string;
  private readonly aiProviderApiKey: string;
  private readonly AgentExecutor: AgentExecutor;

  public readonly accountManager: AccountManager;
  public readonly transactionMonitor: TransactionMonitor;
  public readonly contractInteractor: ContractInteractor;

  constructor(private readonly config: StarknetAgentConfig) {
    this.validateConfig(config);

    this.provider = config.provider;
    this.accountPrivateKey = config.accountPrivateKey;
    this.accountPublicKey = config.accountPublicKey;
    this.aiModel = config.aiModel;
    this.aiProviderApiKey = config.aiProviderApiKey;
    this.AgentExecutor = createAgent(this, {
      aiModel: this.aiModel,
      apiKey: this.aiProviderApiKey,
      aiProvider: config.aiProvider,
    });

    this.accountManager = new AccountManager(rpcProvider);
    this.transactionMonitor = new TransactionMonitor(rpcProvider);
    this.contractInteractor = new ContractInteractor(rpcProvider);
  }

  private validateConfig(config: StarknetAgentConfig) {
    if (!config.accountPrivateKey) {
      throw new Error(
        'Starknet wallet private key is required https://www.argent.xyz/argent-x'
      );
    }
    if (config.aiModel !== 'ollama' && !config.aiProviderApiKey) {
      throw new Error('Ai Provider API key is required');
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

  getProvider(): RpcProvider {
    return this.provider;
  }

  async validateRequest(request: string): Promise<boolean> {
    if (!request || typeof request !== 'string') {
      return false;
    }

    try {
      // TODO: add validation logic here
      // For now, returning true as a basic implementation
      return true;
    } catch (error) {
      return false;
    }
  }

  async execute(input: string): Promise<unknown> {
    const response = await this.AgentExecutor.invoke({
      input,
    });
    return response;
  }
}
