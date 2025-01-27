import { IAgent } from '../../agents/interfaces/agent.interface';
import type { AgentExecutor } from 'langchain/agents';
import { createAgent } from './agent';
import { RpcProvider } from 'starknet';
import { AccountManager } from '../utils/account/AccountManager';
import { TransactionMonitor } from '../utils/monitoring/TransactionMonitor';
import { ContractInteractor } from '../utils/contract/ContractInteractor';
import { readSync } from 'fs';
import { ToolsChoice } from './agent';
import { throwError } from 'rxjs';
export interface StarknetAgentConfig {
  aiProviderApiKey: string;
  aiModel: string;
  aiProvider: 'openai' | 'anthropic' | 'ollama' | 'gemini';
  provider: RpcProvider;
  accountPublicKey: string;
  accountPrivateKey: string;
  tools_choice: string;
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
  public readonly tools_choice: ToolsChoice;

  constructor(private readonly config: StarknetAgentConfig) {
    this.validateConfig(config);

    this.provider = config.provider;
    this.accountPrivateKey = config.accountPrivateKey;
    this.accountPublicKey = config.accountPublicKey;
    this.aiModel = config.aiModel;
    this.aiProviderApiKey = config.aiProviderApiKey;
    this.tools_choice = config.tools_choice;

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

  getToolsChoice() {
    return {
      tools_choice: this.tools_choice,
    };
  }

  getProvider(): RpcProvider {
    return this.provider;
  }

  async validateRequest(request: string): Promise<boolean> {
    return Boolean(request && typeof request === 'string');
  }

  async execute(input: string, call_data_function: boolean): Promise<unknown> {
    const aiMessage = await this.agentExecutor.invoke({ input });
    if (call_data_function == true) {
      try {
        if (Array.isArray(aiMessage.output)) {
          for (const item of aiMessage.output) {
            if (item.type === 'text' && item.text) {
              const startIndex = item.text.indexOf('{');
              let collad;
              let i;
              for (i = startIndex + 1; i < item.text.length; i++) {
                if (item.text[i] === '{') {
                  collad = true;
                }
                if (item.text[i] === '}' && collad === true) {
                  collad = false;
                } else if (item.text[i] === '}' && collad === false) {
                  break;
                }
              }
              const endIndex = i + 1;
              if (startIndex !== -1 && endIndex !== -1) {
                const jsonStr = item.text.substring(startIndex, endIndex);
                return JSON.parse(jsonStr);
              }
            }
          }
        } else {
          throw new Error('Output is not an array');
        }
      } catch (error) {
        console.error('Parsing error:', error);
        return aiMessage.output;
      }
    }
    return aiMessage;
  }
}
