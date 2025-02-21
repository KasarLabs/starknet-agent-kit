import { tool } from '@langchain/core/tools';
import { RpcProvider } from 'starknet';
import { AccountManager } from '@starknet-agent-kit/core/src/account/utils/AccountManager';
import { TransactionMonitor } from '@starknet-agent-kit/core/src/transaction/utils/TransactionMonitor';
import { ContractInteractor } from '@starknet-agent-kit/core/src/contract/utils/ContractInteractor';
import { TwitterInterface } from '@starknet-agent-kit/twitter/src/interfaces';
import { Limit } from '../limit';
import { JsonConfig } from '../jsonConfig';
import { TelegramInterface } from '@starknet-agent-kit/telegram/src/interfaces';

export interface PluginManager {
  telegram_manager?: TelegramInterface;
  twitter_manager?: TwitterInterface;
}

export interface StarknetAgentInterface {
  getAccountCredentials: () => {
    accountPublicKey: string;
    accountPrivateKey: string;
  };
  getModelCredentials: () => {
    aiModel: string;
    aiProviderApiKey: string;
  };
  getSignature: () => {
    signature: string;
  };
  getProvider: () => RpcProvider;
  accountManager: AccountManager;
  transactionMonitor: TransactionMonitor;
  contractInteractor: ContractInteractor;
  getLimit: () => Limit;
  getAgentConfig: () => JsonConfig | undefined;
  plugins_manager: PluginManager;
}

export interface StarknetTool<P = any> {
  name: string;
  plugins: string;
  description: string;
  schema?: object;
  responseFormat?: string;
  execute: (
    agent: StarknetAgentInterface,
    params: P,
    plugins_manager?: any
  ) => Promise<unknown>;
}

export class StarknetToolRegistry {
  private static tools: StarknetTool[] = [];

  static registerTool<P>(tool: StarknetTool<P>): void {
    this.tools.push(tool);
  }

  static createTools(agent: StarknetAgentInterface) {
    return this.tools.map(({ name, description, schema, execute }) =>
      tool(async (params: any) => execute(agent, params), {
        name,
        description,
        ...(schema && { schema }),
      })
    );
  }

  static async createAllowedTools(
    agent: StarknetAgentInterface,
    allowed_tools: string[]
  ) {
    await registerTools(agent, allowed_tools);
    console.log('Allowed tools:', this.tools);
    return this.tools.map(({ name, description, schema, execute }) =>
      tool(async (params: any) => execute(agent, params), {
        name,
        description,
        ...(schema && { schema }),
      })
    );
  }
}

export const initializeTools = (agent: StarknetAgentInterface) => {};

export const registerTools = async (
  agent: StarknetAgentInterface,
  allowed_tools: string[]
) => {
  try {
    await Promise.all(
      allowed_tools.map(async (tool) => {
        console.log(`Registering tool: ${tool}`);
        if (
          tool === 'transaction' ||
          tool === 'account' ||
          tool === 'contract' ||
          tool === 'rpc' ||
          tool === 'token'
        ) {
          tool = 'core/' + tool;
        }
        const imported_tool = await import(
          `@starknet-agent-kit/${tool}/src/tools/index`
        );
        if (typeof imported_tool.registerTools !== 'function') {
          throw new Error('Tool does not have a registerTools function');
        }
        console.log('Registering tools');
        await imported_tool.registerTools(agent);
        return true; // Retourner le résultat
      })
    );
  } catch (error) {
    console.log(error);
  }
};

// allowed_tools.includes('avnu') && registerAvnuTools();

// allowed_tools.includes('token') && registerTokenTools();

// allowed_tools.includes('rpc') && registerRPCTools();

// allowed_tools.includes('transaction') && registerTransactionTools();

// allowed_tools.includes('unraggable') && registerUnraggableTools();

// allowed_tools.includes('twitter') && (await registerTwitterTools(agent));

// allowed_tools.includes('fibrous') && registerFibrousTools();

// allowed_tools.includes('telegram') && registerTelegramTools(agent);

// Initialize tools

export const createTools = (agent: StarknetAgentInterface) => {
  return StarknetToolRegistry.createTools(agent);
};

export const createAllowedTools = async (
  agent: StarknetAgentInterface,
  allowed_tools: string[]
) => {
  return StarknetToolRegistry.createAllowedTools(agent, allowed_tools);
};

export default StarknetToolRegistry;
