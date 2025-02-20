import { StarknetToolRegistry } from 'src/lib/agent/tools/tools';

import {
  getAllowanceSchema,
  getTotalSupplySchema,
  transferFromSchema,
  getBalanceSchema,
  getOwnBalanceSchema,
  approveSchema,
  transferSchema,
  getMyGivenAllowanceSchema,
  getAllowanceGivenToMeSchema,
} from '../../../erc20/schemas/schema';

import { getAllowance } from '../../../erc20/actions/getAllowance';
import { getTotalSupply } from '../../../erc20/actions/getTotaSupply';
import { transferFrom } from '../../../erc20/actions/transferFrom';
import { getBalance, getOwnBalance } from '../../../erc20/actions/getBalances';
import { approve } from '../../../erc20/actions/approve';
import { transfer } from '../../../erc20/actions/transfer';
import { getMyGivenAllowance } from '../../../erc20/actions/getAllowance';
import { getAllowanceGivenToMe } from '../../../erc20/actions/getAllowance';

export const registerTokenTools = () => {
  StarknetToolRegistry.registerTool({
    name: 'get_allowance',
    plugins: 'token',
    description:
      'Get the amount of tokens that a spender is allowed to spend on behalf of an owner. Requires the token symbol (e.g., ETH, USDC), the owner address and the spender address.',
    schema: getAllowanceSchema,
    execute: getAllowance,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_my_given_allowance',
    plugins: 'token',
    description:
      'Get the amount of tokens that a spender is allowed to spend on your behalf. Requires the token symbol (e.g., ETH, USDC) and the spender address.',
    schema: getMyGivenAllowanceSchema,
    execute: getMyGivenAllowance,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_allowance_given_to_me',
    plugins: 'token',
    description:
      'Get the amount of tokens that a you are allowed to spend on the behalf of an owner. Requires the token symbol (e.g., ETH, USDC) and the owner address.',
    schema: getAllowanceGivenToMeSchema,
    execute: getAllowanceGivenToMe,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_total_supply',
    plugins: 'token',
    description: 'Get the total supply of an token token',
    schema: getTotalSupplySchema,
    execute: getTotalSupply,
  });

  StarknetToolRegistry.registerTool({
    name: 'transfer_from',
    plugins: 'token',
    description:
      'Transfer tokens from one address to another using an allowance',
    schema: transferFromSchema,
    execute: transferFrom,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_balance',
    plugins: 'token',
    description: 'Get the balance of an asset for a given wallet address',
    schema: getBalanceSchema,
    execute: getBalance,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_own_balance',
    plugins: 'token',
    description: 'Get the balance of an asset in your wallet',
    schema: getOwnBalanceSchema,
    execute: getOwnBalance,
  });

  StarknetToolRegistry.registerTool({
    name: 'approve',
    plugins: 'token',
    description: 'Approve a spender to spend tokens on your behalf',
    schema: approveSchema,
    execute: approve,
  });

  StarknetToolRegistry.registerTool({
    name: 'transfer',
    plugins: 'token',
    description: 'Transfer ERC20 tokens to a specific address',
    schema: transferSchema,
    execute: transfer,
  });
};
