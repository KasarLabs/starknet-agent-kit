import StarknetToolRegistry from 'src/lib/agent/tools/tools';
import {
  borrowTroveSchema,
  collateralActionSchema,
  getTroveHealthSchema,
  getUserTrovesSchema,
  openTroveSchema,
  repayTroveSchema,
} from '../schemas';
import { openTrove } from '../actions/openTrove';
import {
  getBorrowFee,
  getTroveHealth,
  getUserTroves,
} from '../actions/getters';
import { depositTrove } from '../actions/depositTrove';
import { withdrawTrove } from '../actions/withdrawTrove';
import { borrowTrove } from '../actions/borrowTrove';
import { repayTrove } from '../actions/repayTrove';

export const registerOpusTools = () => {
  StarknetToolRegistry.registerTool({
    name: 'open_trove',
    plugins: 'opus',
    description: 'Open a Trove on Opus',
    schema: openTroveSchema,
    execute: openTrove,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_user_troves',
    plugins: 'opus',
    description: 'Get trove IDs for an address on Opus',
    schema: getUserTrovesSchema,
    execute: getUserTroves,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_trove_health',
    plugins: 'opus',
    description: 'Get the health of a trove on Opus',
    schema: getTroveHealthSchema,
    execute: getTroveHealth,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_borrow_fee',
    plugins: 'opus',
    description: 'Get the current borrow fee for Opus',
    execute: getBorrowFee,
  });

  StarknetToolRegistry.registerTool({
    name: 'deposit_trove',
    plugins: 'opus',
    description: 'Deposit collateral to a Trove on Opus',
    schema: collateralActionSchema,
    execute: depositTrove,
  });

  StarknetToolRegistry.registerTool({
    name: 'withdraw_trove',
    plugins: 'opus',
    description: 'Withdraw collateral from a Trove on Opus',
    schema: collateralActionSchema,
    execute: withdrawTrove,
  });

  StarknetToolRegistry.registerTool({
    name: 'borrow_trove',
    plugins: 'opus',
    description: 'Borrow CASH for a Trove on Opus',
    schema: borrowTroveSchema,
    execute: borrowTrove,
  });

  StarknetToolRegistry.registerTool({
    name: 'repay_trove',
    plugins: 'opus',
    description: 'Repay CASH for a Trove on Opus',
    schema: repayTroveSchema,
    execute: repayTrove,
  });
};
