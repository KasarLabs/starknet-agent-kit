import { tool } from '@langchain/core/tools';
import {
  getBalanceSignatureSchema,
  transferSignatureschema,
} from '../schema/signature_schema';
import { transfer_signature } from '../method/token/transfer';
import { getBalanceSignature } from '../method/read/getBalances';
import {
  CreateArgentAccountSignature,
  CreateOZAccountSignature,
} from '../method/account/createAccount';
import {
  DeployArgentAccountSchema,
  DeployOZAccountSchema,
} from '../schema/schema';
import {
  DeployArgentAccountSignature,
  DeployOZAccountSignature,
} from '../method/account/deployAccount';

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

export const RegisterSignatureTools = () => [
  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'transfer',
    description: 'return transfer json transaction',
    schema: transferSignatureschema,
    execute: transfer_signature,
  }),
  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'getbalance',
    description: 'return the amoumt of token at a account address',
    schema: getBalanceSignatureSchema,
    execute: getBalanceSignature,
  }),
  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'create_argent_account',
    description:
      'create argent account return the privateKey/publicKey/contractAddress',
    execute: CreateArgentAccountSignature,
  }),
  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'create_open_zeppelin_account',
    description:
      'create open_zeppelin/OZ account return the privateKey/publicKey/contractAddress',
    execute: CreateOZAccountSignature,
  }),
  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'deploy_argent_account',
    description: 'deploy argent account return the deploy transaction address',
    schema: DeployArgentAccountSchema,
    execute: DeployArgentAccountSignature,
  }),
  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'deploy_open_zeppelin_account',
    description:
      'deploy open_zeppelin account return the deploy transaction address',
    schema: DeployOZAccountSchema,
    execute: DeployOZAccountSignature,
  }),
];

RegisterSignatureTools();

export const createSignatureTools = () => {
  return StarknetSignatureToolRegistry.createSignatureTools();
};

export default StarknetSignatureToolRegistry;
