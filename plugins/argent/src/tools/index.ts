import { CreateArgentAccount } from '../actions/createAccount';
import { DeployArgentAccount } from '../actions/deployAccount';
import { accountDetailsSchema } from '../schemas/schema';
import { StarknetTool } from '@starknet-agent-kit/agents';

export const registerTools = (tool: StarknetTool[]) => {
  tool.push({
    name: 'create_argent_x_account',
    description:
      'Create Argent X Account return the privateKey/publicKey/contractAddress',
    plugins: 'argent',
    execute: CreateArgentAccount,
  });
  tool.push({
    name: 'deploy_existing_argent_account',
    description:
      'Deploy an existing Argent Account return the privateKey/publicKey/contractAddress',
    plugins: 'argent',
    schema: accountDetailsSchema,
    execute: DeployArgentAccount,
  });
};
