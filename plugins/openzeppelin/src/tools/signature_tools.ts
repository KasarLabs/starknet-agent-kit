import { SignatureTool } from '@starknet-agent-kit/agents';
import { accountDetailsSchema } from '../schemas/schema';
import { CreateOZAccountSignature } from '../actions/createAccount';
import { DeployOZAccountSignature } from '../actions/deployAccount';

export const registerSignatureTools = (tools: SignatureTool[]) => {

    tools.push({
    name: 'create_open_zeppelin_account',
    description:
      'create open_zeppelin/OZ account return the privateKey/publicKey/contractAddress',
    execute: CreateOZAccountSignature,
  }),
    tools.push({
    name: 'deploy_openzeppelin_account',
    description:
      'deploy open_zeppelin account return the privateKey/publicKey/contractAddress',
    schema: accountDetailsSchema,
    execute: DeployOZAccountSignature,
  })
};
