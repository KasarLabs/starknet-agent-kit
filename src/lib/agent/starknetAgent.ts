import { IAgent } from '../../agents/interfaces/agent.interface';
import type { AgentExecutor } from 'langchain/agents';
import { createAgent } from './agent';
import { RpcProvider } from 'starknet';
import { RPC_URL } from '../constant';
import { AccountManager } from '../utils/account/AccountManager';
import { TransactionMonitor } from '../utils/monitoring/TransactionMonitor';
import { ContractInteractor } from '../utils/contract/ContractInteractor';

export const rpcProvider = new RpcProvider({ nodeUrl: RPC_URL });

export interface StarknetAgentConfig {
  walletPrivateKey: string;
  anthropicApiKey: string;
}

export class StarknetAgent implements IAgent {
  private readonly walletPrivateKey: string;
  private readonly AgentExecutor: AgentExecutor;
  private readonly anthropicApiKey: string;

  // New utility instances
  public readonly accountManager: AccountManager;
  public readonly transactionMonitor: TransactionMonitor;
  public readonly contractInteractor: ContractInteractor;

  constructor(config: StarknetAgentConfig) {
    this.validateConfig(config);

    this.walletPrivateKey = config.walletPrivateKey;
    this.anthropicApiKey = config.anthropicApiKey;
    this.AgentExecutor = createAgent(this, this.anthropicApiKey);

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
    if (!config.anthropicApiKey) {
      throw new Error('Anthropic API key is required');
    }
  }

  getCredentials() {
    return {
      walletPrivateKey: this.walletPrivateKey,
      anthropicApiKey: this.anthropicApiKey,
    };
  }

  async execute(input: string): Promise<unknown> {
    const response = await this.AgentExecutor.invoke({
      input,
    });
    return response;
  }
}
