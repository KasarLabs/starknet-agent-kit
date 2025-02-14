import { StarknetToolRegistry } from 'src/lib/agent/tools/tools';
import { CreateArgentAccount, CreateOZAccount } from '../actions/createAccount';
import { DeployArgentAccount, DeployOZAccount } from '../actions/deployAccount';
import { DeployArgentAccountSchema, DeployOZAccountSchema } from '../schema';

export const registerAccountTools = () => {
  StarknetToolRegistry.registerTool({
    name: 'CreateOZAccount',
    plugins: 'account',
    description: 'Create Open Zeppelin account',
    execute: CreateOZAccount,
  });

  StarknetToolRegistry.registerTool({
    name: 'DeployOZ',
    plugins: 'account',
    description: 'Deploy a OZ Account',
    schema: DeployOZAccountSchema,
    execute: DeployOZAccount,
  });

  StarknetToolRegistry.registerTool({
    name: 'CreateArgentAccount',
    plugins: 'account',
    description: 'Create Account account',
    execute: CreateArgentAccount,
  });

  StarknetToolRegistry.registerTool({
    name: 'DeployArgent',
    plugins: 'account',
    description: 'Deploy a Argent Account',
    schema: DeployArgentAccountSchema,
    execute: DeployArgentAccount,
  });
};
