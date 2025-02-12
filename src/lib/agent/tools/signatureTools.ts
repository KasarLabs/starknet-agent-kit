import { tool } from '@langchain/core/tools';
import {
  getBalanceSignatureSchema,
  transferSignatureschema,
} from '../schemas/signatureSchemas';
import { transfer_signature } from '../plugins/core/token/actions/transfer';
import { getBalanceSignature } from '../plugins/core/token/actions/getBalances';
import {
  CreateArgentAccountSignature,
  CreateOZAccountSignature,
} from '../plugins/core/account/actions/createAccount';
import {
  DeployArgentAccountSchema,
  DeployOZAccountSchema,
} from '../plugins/core/account/schema';
import {
  DeployArgentAccountSignature,
  DeployOZAccountSignature,
} from '../plugins/core/account/actions/deployAccount';
import { registerSignatureToolsAccount } from '../plugins/core/account/tools/tools_signature';
import { registerSignatureToolsToken } from '../plugins/core/token/tools/tools_signature';

interface SignatureTool<P = any> {
  name: string;
  description: string;
  schema?: object;
  execute: (params: P) => Promise<unknown>;
}

export class StarknetSignatureToolRegistry {
  private static tools: SignatureTool[] = [];

  static RegisterSignatureTools<P>(tool: SignatureTool<P>): void {
    this.tools.push(tool);
  }

  static createSignatureTools() {
    return this.tools.map(({ name, description, schema, execute }) => {
      const toolInstance = tool(async (params: any) => execute(params), {
        name,
        description,
        ...(schema && { schema }),
      });
      return toolInstance;
    });
  }
}

export const RegisterSignatureTools = () => {
  registerSignatureToolsToken();
  registerSignatureToolsAccount();
};

RegisterSignatureTools();

export const createSignatureTools = () => {
  return StarknetSignatureToolRegistry.createSignatureTools();
};

export default StarknetSignatureToolRegistry;
