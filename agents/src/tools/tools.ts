import { tool } from '@langchain/core/tools';
import { RpcProvider } from 'starknet';
import { TransactionMonitor } from '../../common';
import { ContractInteractor } from '../../common';
import { TwitterInterface } from '../../common';
import { JsonConfig } from '../jsonConfig';
import { TelegramInterface } from '../../common';
// import { registerTwitterTools } from '@plugins/twitter/tools';
// import { registerUnraggableTools } from '@plugins/unruggable/tools';
// import { registerTransactionTools } from '@plugins/core/transaction/tools';
// import { registerRPCTools } from '@plugins/core/rpc/tools';
// import { registerTokenTools } from '@plugins/core/token/tools';
// import { registerAvnuTools } from '@plugins/avnu/tools';
// import { registerAccountTools } from '@plugins/core/account/tools/index';
// import { registerFibrousTools } from '@plugins/fibrous/tools';
// import { registerOpusTools } from '@plugins/opus/tools';
// import { register } from 'module';
// import { registerAtlanticTools } from '@plugins/atlantic/tools';
// import { registerTelegramTools } from '@plugins/telegram/tools';
// import { TelegramInterface } from '@plugins/telegram/interfaces';
// import { registerArtpeaceTools } from '@plugins/artpeace/tools';
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
  transactionMonitor: TransactionMonitor;
  contractInteractor: ContractInteractor;
  getTwitterAuthMode: () => 'API' | 'CREDENTIALS' | undefined;
  getAgentConfig: () => JsonConfig | undefined;
  getTwitterManager: () => TwitterInterface;
  getTelegramManager: () => TelegramInterface;
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
    console.log(allowed_tools);
    await registerTools(agent, allowed_tools, this.tools);
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
  allowed_tools: string[],
  tools: StarknetTool[]
) => {
  try {
    await Promise.all(
      allowed_tools.map(async (tool) => {
        let imported_tool;
        imported_tool = await import(`@starknet-agent-kit/plugin-${tool}`);
        if (typeof imported_tool.registerTools !== 'function') {
          throw new Error(
            `Tool does not have a registerTools function ${tool}`
          );
        }
        console.log(`Registering tools ${tool}`);
        imported_tool.registerTools(tools);
        return true;
      })
    );
  } catch (error) {
    console.log(error);
  }
};

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
