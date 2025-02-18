import { tool } from '@langchain/core/tools';
import {
  getBalanceSignatureSchema,
  transferSignatureschema,
} from '../schemas/signatureSchemas';
import { transfer_signature } from '../plugins/core/token/transfer';
import { getBalanceSignature } from '../plugins/core/token/getBalances';

import { CreateAXAccountSignature } from '../plugins/argentx/actions/createAccount';
import { DeployAXAccountSignature } from '../plugins/argentx/actions/deployAccount';
import { CreateOZAccountSignature } from '../plugins/openzeppelin/actions/createAccount';
import { DeployOZAccountSignature } from '../plugins/openzeppelin/actions/deployAccount';
import { CreateOKXAccountSignature } from '../plugins/okx/actions/createAccount';
import { DeployOKXAccountSignature } from '../plugins/okx/actions/deployAccount';
import { CreateBraavosAccountSignature } from '../plugins/braavos/actions/createAccount';
import { DeployBraavosAccountSignature } from '../plugins/braavos/actions/deployAccount';

import { accountDetailsSchema } from '../plugins/argentx/schemas/schema';

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

  // Register account-related tools
  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'create_argentx_account',
    description:
      'create argentx account return the privateKey/publicKey/contractAddress',
    execute: CreateAXAccountSignature,
  }),

  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'create_open_zeppelin_account',
    description:
      'create open_zeppelin/OZ account return the privateKey/publicKey/contractAddress',
    execute: CreateOZAccountSignature,
  }),

  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'create_okx_account',
    description:
      'create okx account return the privateKey/publicKey/contractAddress',
    execute: CreateOKXAccountSignature,
  }),

  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'create_braavos_account',
    description:
      'create braavos account return the privateKey/publicKey/contractAddress',
    execute: CreateBraavosAccountSignature,
  }),

  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'deploy_argent_account',
    description: 'deploy argent account return the privateKey/publicKey/contractAddress',
    schema: accountDetailsSchema,
    execute: DeployAXAccountSignature,
  }),

  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'deploy_open_zeppelin_account',
    description:
      'deploy open_zeppelin account return the privateKey/publicKey/contractAddress',
    schema: accountDetailsSchema,
    execute: DeployOZAccountSignature,
  }),

  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'deploy_okx_account',
    description: 'deploy okx account return the privateKey/publicKey/contractAddress',
    schema: accountDetailsSchema,
    execute: DeployOKXAccountSignature,
  }),

  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'deploy_braavos_account',
    description: 'deploy braavos account return the privateKey/publicKey/contractAddress',
    schema: accountDetailsSchema,
    execute: DeployBraavosAccountSignature,
  }),
];

RegisterSignatureTools();

export const createSignatureTools = () => {
  return StarknetSignatureToolRegistry.createSignatureTools();
};

export default StarknetSignatureToolRegistry;
