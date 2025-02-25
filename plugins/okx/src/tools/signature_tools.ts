import { SignatureTool } from '@starknet-agent-kit/agents';
import { accountDetailsSchema } from '../schemas/schema';
import { DeployOKXAccountSignature } from '../actions/deployAccount';
import { CreateOKXAccountSignature } from '../actions/createAccount';

export const registerSignatureTools = (tools: SignatureTool[]) => {
  tools.push({
    name: 'create_okx_account',
    description:
      'create okx account return the privateKey/publicKey/contractAddress',
    execute: CreateOKXAccountSignature,
  }),
    tools.push({
      name: 'deploy_okx_account',
      description:
        'deploy okx account return the privateKey/publicKey/contractAddress',
      schema: accountDetailsSchema,
      execute: DeployOKXAccountSignature,
    });
};