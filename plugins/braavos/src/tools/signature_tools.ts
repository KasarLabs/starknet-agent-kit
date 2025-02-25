import { SignatureTool } from '@starknet-agent-kit/agents';
import { accountDetailsSchema } from '../schemas/schema';
import { CreateBraavosAccountSignature } from '../actions/createAccount';
import { DeployBraavosAccountSignature } from '../actions/deployAccount';

export const registerSignatureTools = (tools: SignatureTool[]) => {
  tools.push({
    name: 'create_braavos_account',
    description:
      'create braavos account return the privateKey/publicKey/contractAddress',
    execute: CreateBraavosAccountSignature,
  }),
    tools.push({
      name: 'deploy_braavos_account',
      description:
        'deploy braavos account return the privateKey/publicKey/contractAddress',
      schema: accountDetailsSchema,
      execute: DeployBraavosAccountSignature,
    });
};
