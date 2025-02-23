import {
  StarknetAgentInterface,
  StarknetToolRegistry,
} from '@starknet-agent-kit/agent';
import { getBalanceSchema, Transferschema } from '../schema';
import { transfer } from '../actions/transfer';
import { getBalance, getOwnBalance } from '../actions/getBalances';
import { getOwnBalanceSchema } from '../schema';

export const registerTokenTools = (agent: StarknetAgentInterface) => {
  StarknetToolRegistry.registerTool({
    name: 'transfer',
    plugins: 'token',
    description: 'Transfer ERC20 tokens to a specific address',
    schema: Transferschema,
    execute: transfer,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_own_balance',
    plugins: 'token',
    description: 'Get the balance of an asset in your wallet',
    schema: getOwnBalanceSchema,
    execute: getOwnBalance,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_balance',
    plugins: 'token',
    description: 'Get the balance of an asset for a given wallet address',
    schema: getBalanceSchema,
    execute: getBalance,
  });
};
