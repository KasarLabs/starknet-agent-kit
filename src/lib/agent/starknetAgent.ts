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
  walletPrivateKey: string;
  aiProviderApiKey: string;
  aiModel: string;
  aiProvider: string;
}

export class StarknetAgent implements IAgent {
  private readonly walletPrivateKey: string;
  private readonly AgentExecutor: AgentExecutor;
  private readonly aiProviderApiKey: string;
  private readonly aiModel: string;

  // New utility instances
  public readonly accountManager: AccountManager;
  public readonly transactionMonitor: TransactionMonitor;
  public readonly contractInteractor: ContractInteractor;

  constructor(config: StarknetAgentConfig) {
    this.validateConfig(config);

    this.walletPrivateKey = config.walletPrivateKey;
    this.aiProviderApiKey = config.aiProviderApiKey;
    this.aiModel = config.aiModel;
    this.AgentExecutor = createAgent(this, {
      aiModel: this.aiModel,
      apiKey: this.aiProviderApiKey,
      aiProvider: config.aiProvider,
    });

    // Initialize utility classes
    this.accountManager = new AccountManager(rpcProvider);
    this.transactionMonitor = new TransactionMonitor(rpcProvider);
    this.contractInteractor = new ContractInteractor(rpcProvider);
  }

  private validateConfig(config: StarknetAgentConfig) {
    if (!config.walletPrivateKey) {
      throw new Error(
        'Starknet wallet private key is required https://www.argent.xyz/argent-x'
      );
    }
    if (config.aiModel !== 'ollama' && !config.aiProviderApiKey) {
      throw new Error('Ai Provider API key is required');
    }
  }

  getCredentials() {
    return {
      walletPrivateKey: this.walletPrivateKey,
      aiProviderApiKey: this.aiProviderApiKey,
      aiModel: this.aiModel,
    };
  }

  async validateRequest(request: string): Promise<boolean> {
    // Basic validation - check if request is non-empty and is a string
    if (!request || typeof request !== 'string') {
      return false;
    }

    try {
      // Add your validation logic here
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
