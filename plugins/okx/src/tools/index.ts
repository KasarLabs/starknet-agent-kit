import { wrapAccountCreationResponse } from '../utils/AccountManager';
import { accountDetailsSchema } from '../schemas/schema';
import {
  StarknetAgentInterface,
  StarknetTool,
} from '@starknet-agent-kit/agents';
import { DeployOKXAccount } from '../actions/deployAccount';
import { CreateOKXAccount } from '../actions/createAccount';

export const registerTools = (tool: StarknetTool[]) => {
  tool.push({
    name: 'create_new_okx_account',
    description:
      'Create a new OKX account and return the privateKey/publicKey/contractAddress',
    plugins: 'okx',
    execute: async (agent: StarknetAgentInterface) => {
      const response = await CreateOKXAccount();
      return wrapAccountCreationResponse(response);
    },
  });

  tool.push({
    name: 'deploy_existing_okx_account',
    description:
      'Deploy an existing OKX Account return the privateKey/publicKey/contractAddress',
    plugins: 'okx',
    schema: accountDetailsSchema,
    execute: DeployOKXAccount,
  });
};
