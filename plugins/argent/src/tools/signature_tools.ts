import { SignatureTool } from '@starknet-agent-kit/agents';
import { accountDetailsSchema } from '../schemas/schema';
import { DeployArgentAccountSignature } from '../actions/deployAccount';
import { CreateArgentAccountSignature } from '../actions/createAccount';

export const registerSignatureTools = (
  StarknetToolRegistry: SignatureTool[]
) => {
  StarknetToolRegistry.push({
    name: 'create_argent_x_account',
    description:
      'create argent account return the privateKey/publicKey/contractAddress',
    execute: CreateArgentAccountSignature,
  }),
    StarknetToolRegistry.push({
      name: 'deploy_argent_account',
      description:
        'deploy ArgentX account return the privateKey/publicKey/contractAddress',
      schema: accountDetailsSchema,
      execute: DeployArgentAccountSignature,
    });
};
