import { tool } from '@langchain/core/tools';
import { RpcProvider } from 'starknet';
import { AccountManager } from '../plugins/core/account/utils/AccountManager';
import { TransactionMonitor } from '../plugins/core/transaction/utils/TransactionMonitor';
import { ContractInteractor } from '../plugins/core/contract/utils/ContractInteractor';
import { TwitterInterface } from '../plugins/twitter/interfaces';
import { Limit } from '../limit';
import { JsonConfig } from '../jsonConfig';
import { registerTwitterTools } from '../plugins/twitter/tools';
import { registerUnraggableTools } from '../plugins/unruggable/tools';
import { registerTransactionTools } from '../plugins/core/transaction/tools';
import { registerRPCTools } from '../plugins/core/rpc/tools';
import { registerTokenTools } from '../plugins/core/token/tools';
import { registerAvnuTools } from '../plugins/avnu/tools';
import { registerAccountTools } from '../plugins/core/account/tools/index';
import { registerFibrousTools } from '../plugins/fibrous/tools';
import { registerTelegramTools } from '../plugins/telegram/tools';
import { TelegramInterface } from '../plugins/telegram/interfaces';
import { agent } from 'supertest';

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

  static async createAllowedTools (
    agent: StarknetAgentInterface,
    allowed_tools: string[]
  ) {
    await registerTools(agent, allowed_tools);
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
  allowed_tools.includes('account') && registerAccountTools();

  allowed_tools.includes('avnu') && registerAvnuTools();

  allowed_tools.includes('token') && registerTokenTools();

  allowed_tools.includes('rpc') && registerRPCTools();

  allowed_tools.includes('transaction') && registerTransactionTools();

  allowed_tools.includes('unraggable') && registerUnraggableTools();

  allowed_tools.includes('twitter') && await registerTwitterTools(agent);

  allowed_tools.includes('fibrous') && registerFibrousTools();

  allowed_tools.includes('telegram') && registerTelegramTools(agent);
};

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
