import { StarknetToolRegistry } from 'src/lib/agent/tools/tools';

import {
  getAllowanceSchema,
  getTotalSupplySchema,
  transferFromSchema,
  getBalanceSchema,
  getOwnBalanceSchema,
  approveSchema,
  transferSchema
} from '../../../erc20/schemas/schema';

import { getAllowance } from '../../../erc20/actions/getAllowance';
import { getTotalSupply } from '../../../erc20/actions/getTotaSupply';
import { transfer_from } from '../../../erc20/actions/transferFrom';
import { getBalance, getOwnBalance } from '../../../erc20/actions/getBalances';
import { approve } from '../../../erc20/actions/approve';
import { transfer } from '../../../erc20/actions/transfer';

export const registerTokenTools = () => {
  // Register getAllowance tool
  StarknetToolRegistry.registerTool({
    name: 'get_allowance',
    plugins: 'token',
    description: 'Get the amount of tokens that a spender is allowed to spend on behalf of an owner',
    schema: getAllowanceSchema,
    execute: getAllowance,
  });

  // Register getTotalSupply tool
  StarknetToolRegistry.registerTool({
    name: 'get_total_supply',
    plugins: 'token',
    description: 'Get the total supply of an token token',
    schema: getTotalSupplySchema,
    execute: getTotalSupply,
  });

  // Register transferFrom tool
  StarknetToolRegistry.registerTool({
    name: 'transfer_from',
    plugins: 'token',
    description: 'Transfer tokens from one address to another using an allowance',
    schema: transferFromSchema,
    execute: transfer_from,
  });

  // Register getBalance tool
  StarknetToolRegistry.registerTool({
    name: 'get_balance',
    plugins: 'token',
    description: 'Get the balance of an asset for a given wallet address',
    schema: getBalanceSchema,
    execute: getBalance,
  });

  // Register getOwnBalance tool
  StarknetToolRegistry.registerTool({
    name: 'get_own_balance',
    plugins: 'token',
    description: 'Get the balance of an asset in your wallet',
    schema: getOwnBalanceSchema,
    execute: getOwnBalance,
  });

  // Register approve tool
  StarknetToolRegistry.registerTool({
    name: 'approve',
    plugins: 'token',
    description: 'Approve a spender to spend tokens on your behalf',
    schema: approveSchema,
    execute: approve,
  });

  // Register transfer tool
  StarknetToolRegistry.registerTool({
    name: 'transfer',
    plugins: 'token',
    description: 'Transfer ERC20 tokens to a specific address',
    schema: transferSchema,
    execute: transfer,
  });
};