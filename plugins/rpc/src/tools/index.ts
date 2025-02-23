import {
  StarknetAgentInterface,
  StarknetToolRegistry,
} from '@starknet-agent-kit/agent';
import { getSpecVersion } from '../actions/getSpecVersion';
import { getBlockWithTxHashes } from '../actions/getBlockWithTxHashes';
import { getBlockWithReceipts } from '../actions/getBlockWithReceipts';
import { getTransactionStatus } from '../actions/getTransactionStatus';
import { getClass } from '../actions/getClass';
import { getChainId } from '../actions/getChainId';
import { getSyncingStats } from '../actions/getSyncingStats';
import { getBlockNumber } from '../actions/getBlockNumber';
import { getBlockTransactionCount } from '../actions/getBlockTransactionCount';
import { getStorageAt } from '../actions/getStorageAt';
import { getClassAt } from '../actions/getClassAt';
import { getClassHashAt } from '../actions/getClassHash';
import {
  getStorageAtSchema,
  blockIdSchema,
  blockIdAndContractAddressSchema,
  getClassAtSchema,
  getClassHashAtSchema,
  transactionHashSchema,
} from '../schema';

export const registerRPCTools = (agent: StarknetAgentInterface) => {
  StarknetToolRegistry.registerTool({
    name: 'get_chain_id',
    plugins: 'rpc',
    description:
      'Retrieve the unique identifier (chain ID) of the Starknet network',
    execute: getChainId,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_syncing_status',
    plugins: 'rpc',
    description: 'Retrieve the syncing status of the Starknet node',
    execute: getSyncingStats,
  });

  // Add remaining tools from createTools2
  StarknetToolRegistry.registerTool({
    name: 'get_class_hash',
    plugins: 'rpc',
    description:
      'Retrieve the unique class hash for a contract at a specific address',
    schema: getClassHashAtSchema,
    execute: getClassHashAt,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_spec_version',
    plugins: 'rpc',
    description: 'Get the current spec version from the Starknet RPC provider',
    execute: getSpecVersion,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_block_with_tx_hashes',
    plugins: 'rpc',
    description:
      'Retrieve the details of a block, including transaction hashes',
    schema: blockIdSchema,
    execute: getBlockWithTxHashes,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_block_with_receipts',
    plugins: 'rpc',
    description: 'Fetch block details with transaction receipts',
    schema: blockIdSchema,
    execute: getBlockWithReceipts,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_transaction_status',
    plugins: 'rpc',
    description: 'Fetch transaction status by hash',
    schema: transactionHashSchema,
    execute: getTransactionStatus,
  });

  // Register blockchain query tools
  StarknetToolRegistry.registerTool({
    name: 'get_block_number',
    plugins: 'rpc',
    description: 'Get the current block number from the Starknet network',
    execute: getBlockNumber,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_block_transaction_count',
    plugins: 'rpc',
    description: 'Get the number of transactions in a specific block',
    schema: blockIdSchema,
    execute: getBlockTransactionCount,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_storage_at',
    plugins: 'rpc',
    description: 'Get the storage value at a specific slot for a contract',
    schema: getStorageAtSchema,
    execute: getStorageAt,
  });

  // Register contract-related tools
  StarknetToolRegistry.registerTool({
    name: 'get_class',
    plugins: 'rpc',
    description:
      'Retrieve the complete class definition of a contract at a specified address and block',
    schema: blockIdAndContractAddressSchema,
    execute: getClass,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_class_at',
    plugins: 'rpc',
    description:
      'Fetch the class definition of a contract at a specific address in the latest state',
    schema: getClassAtSchema,
    execute: getClassAt,
  });
};
