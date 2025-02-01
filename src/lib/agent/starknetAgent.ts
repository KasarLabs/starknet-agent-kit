import { IAgent } from '../../agents/interfaces/agent.interface';
import type { AgentExecutor } from 'langchain/agents';
import { createAgent } from './agent';
import { RpcProvider } from 'starknet';
import { AccountManager } from '../utils/account/AccountManager';
import { TransactionMonitor } from '../utils/monitoring/TransactionMonitor';
import { ContractInteractor } from '../utils/contract/ContractInteractor';
export interface StarknetAgentConfig {
  aiProviderApiKey: string;
  aiModel: string;
  aiProvider: 'openai' | 'anthropic' | 'ollama' | 'gemini';
  provider: RpcProvider;
  accountPublicKey: string;
  accountPrivateKey: string;
  signature: string;
}

export class StarknetAgent implements IAgent {
  private readonly provider: RpcProvider;
  private readonly accountPrivateKey: string;
  private readonly accountPublicKey: string;
  private readonly aiModel: string;
  private readonly aiProviderApiKey: string;
  private readonly agentExecutor: AgentExecutor;

  public readonly accountManager: AccountManager;
  public readonly transactionMonitor: TransactionMonitor;
  public readonly contractInteractor: ContractInteractor;
  public readonly signature: string;

  constructor(private readonly config: StarknetAgentConfig) {
    this.validateConfig(config);

    this.provider = config.provider;
    this.accountPrivateKey = config.accountPrivateKey;
    this.accountPublicKey = config.accountPublicKey;
    this.aiModel = config.aiModel;
    this.aiProviderApiKey = config.aiProviderApiKey;
    this.signature = config.signature;

    // Initialize managers
    this.accountManager = new AccountManager(this.provider);
    this.transactionMonitor = new TransactionMonitor(this.provider);
    this.contractInteractor = new ContractInteractor(this.provider);

    // Create agent executor with tools
    this.agentExecutor = createAgent(this, {
      aiModel: this.aiModel,
      apiKey: this.aiProviderApiKey,
      aiProvider: config.aiProvider,
    });
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

  getProvider(): RpcProvider {
    return this.provider;
  }

  async validateRequest(request: string): Promise<boolean> {
    return Boolean(request && typeof request === 'string');
  }

  async execute_autonomous(): Promise<unknown> {
    for (let i = 0; i < 5; i++) {
      const aiMessage = await this.agentExecutor.invoke({ input: 'Hello' });
      console.log(aiMessage);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      console.log(i);
    }
    return;
  }

  async execute(input: string): Promise<unknown> {
    const aiMessage = await this.agentExecutor.invoke({ input });
    return aiMessage;
  }

  async execute_call_data(input: string): Promise<unknown> {
    const aiMessage = await this.agentExecutor.invoke({ input });
    if (!aiMessage?.intermediateSteps?.length) {
      return {
        status: 'failure',
        error: 'No intermediate steps found in AI response',
      };
    }

    const lastStep =
      aiMessage.intermediateSteps[aiMessage.intermediateSteps.length - 1];
    if (!lastStep.observation) {
      return {
        status: 'failure',
        error: 'No observation found in last step',
      };
    }
    const result = lastStep.observation;
    try {
      const parsedResult = JSON.parse(result);
      return parsedResult;
    } catch (parseError) {
      return {
        status: 'failure',
        error: `Failed to parse observation: ${parseError.message}`,
      };
    }
  }
}
