import { IAgent } from '../../agents/interfaces/agent.interface';
import { createAgent } from './agent';
import { RpcProvider } from 'starknet';
import { AccountManager } from '../utils/account/AccountManager';
import { TransactionMonitor } from '../utils/monitoring/TransactionMonitor';
import { ContractInteractor } from '../utils/contract/ContractInteractor';
import { CompiledStateGraph } from '@langchain/langgraph';
import { createAutonomousAgent } from './agent_autonomous';
export interface StarknetAgentConfig {
  aiProviderApiKey: string;
  aiModel: string;
  aiProvider: 'openai' | 'anthropic' | 'ollama' | 'gemini';
  provider: RpcProvider;
  accountPublicKey: string;
  accountPrivateKey: string;
  signature: string;
  agentmode: string;
}

export class StarknetAgent implements IAgent {
  private readonly provider: RpcProvider;
  private readonly accountPrivateKey: string;
  private readonly accountPublicKey: string;
  private readonly aiModel: string;
  private readonly aiProviderApiKey: string;
  private readonly agentExecutor: any;

  public readonly accountManager: AccountManager;
  public readonly transactionMonitor: TransactionMonitor;
  public readonly contractInteractor: ContractInteractor;
  public readonly signature: string;
  public readonly agentmode: string;

  constructor(private readonly config: StarknetAgentConfig) {
    this.validateConfig(config);

    this.provider = config.provider;
    this.accountPrivateKey = config.accountPrivateKey;
    this.accountPublicKey = config.accountPublicKey;
    this.aiModel = config.aiModel;
    this.aiProviderApiKey = config.aiProviderApiKey;
    this.signature = config.signature;
    this.agentmode = config.agentmode;

    // Initialize managers
    this.accountManager = new AccountManager(this.provider);
    this.transactionMonitor = new TransactionMonitor(this.provider);
    this.contractInteractor = new ContractInteractor(this.provider);

    // Create agent executor with tools
    console.log('Agent Mode : ', this.agentmode);
    if (this.agentmode === 'auto') {
      this.agentExecutor = createAutonomousAgent(this, {
        aiModel: this.aiModel,
        apiKey: this.aiProviderApiKey,
        aiProvider: config.aiProvider,
      });
    }
    if (this.agentmode === 'agent') {
      this.agentExecutor = createAgent(this, {
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
      agentmode: this.agentmode,
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
      const aiMessage = await this.agentExecutor.agent.invoke(
        {
          messages: 'Choose what to do',
        },
        this.agentExecutor.agentConfig
      );
      console.log(aiMessage.messages[aiMessage.messages.length - 1].content);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      console.log(i);
    }
    return;
  }

  async execute(input: string): Promise<unknown> {
    if (this.agentmode != 'agent') {
      throw new Error(
        `Can't use execute call data with agent_mod : ${this.agentmode}`
      );
    }
    const aiMessage = await this.agentExecutor.invoke({ messages: input });
    return aiMessage.messages[aiMessage.messages.length - 1].content;
  }

  async execute_call_data(input: string): Promise<unknown> {
    if (this.agentmode != 'agent') {
      throw new Error(
        `Can't use execute call data with agent_mod : ${this.agentmode}`
      );
    }
    const aiMessage = await this.agentExecutor.invoke({ messages: input });
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
