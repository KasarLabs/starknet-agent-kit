import { tool } from '@langchain/core/tools';
import {
  CreateOZAccount,
  CreateArgentAccount,
} from 'src/lib/agent/method/account/createAccount';
import {
  DeployArgentAccount,
  DeployOZAccount,
} from 'src/lib/agent/method/account/deployAccount';
import { transfer } from './method/token/transfer';
import {
  simulateDeployAccountTransaction,
  simulateInvokeTransaction,
  simulateDeployTransaction,
  simulateDeclareTransaction,
} from 'src/lib/agent/method/transaction/simulateTransaction';
import { getOwnBalance, getBalance } from './method/read/balance';
import { getBlockNumber } from './method/rpc/getBlockNumber';
import { getBlockTransactionCount } from './method/rpc/getBlockTransactionCount';
import { getStorageAt } from './method/rpc/getStorageAt';
import { getClassAt } from './method/rpc/getClassAt';
import { getClassHashAt } from './method/rpc/getClassHash';
import {
  getOwnBalanceSchema,
  getBalanceSchema,
  DeployArgentAccountSchema,
  getStorageAtSchema,
  swapSchema,
  DeployOZAccountSchema,
  Transferschema,
  blockIdSchema,
  getTransactionByBlockIdAndIndexSchema,
  transactionHashSchema,
  blockIdAndContractAddressSchema,
  declareContractSchema,
  estimateAccountDeployFeeSchema,
  signMessageSchema,
  verifyMessageSchema,
  simulateInvokeTransactionSchema,
  simulateDeployAccountTransactionSchema,
  simulateDeployTransactionSchema,
  simulateDeclareTransactionSchema,
  routeSchema,
  createMemecoinSchema,
  launchOnEkuboSchema,
  contractAddressSchema,
} from './schema';
import { swapTokens } from './method/dapps/defi/avnu/swapService';
import { getRoute } from './method/dapps/defi/avnu/fetchRouteService';
import { getSpecVersion } from './method/rpc/getSpecVersion';
import { getBlockWithTxHashes } from './method/rpc/getBlockWithTxHashes';
import { getBlockWithTxs } from './method/rpc/getBlockWithTxs';
import { getBlockWithReceipts } from './method/rpc/getBlockWithReceipts';
import { getBlockStateUpdate } from './method/rpc/getBlockStateUpdate';
import { getTransactionStatus } from './method/rpc/getTransactionStatus';
import { getTransactionByHash } from './method/rpc/getTransactionByHash';
import { getTransactionByBlockIdAndIndex } from './method/rpc/getTransactionByBlockIdAndIndex';
import { getTransactionReceipt } from './method/rpc/getTransactionReceipt';
import { getClass } from './method/rpc/getClass';
import { getBlockLatestAccepted } from './method/rpc/getBlockLatestAccepted';
import { getChainId } from './method/rpc/getChainId';
import { getSyncingStats } from './method/rpc/getSyncingStats';
import { getNonceForAddress } from './method/rpc/getNonceForAddress';
import { getTransactionTrace } from './method/rpc/getTransactionTrace';
import { getBlockTransactionsTraces } from './method/rpc/getBlockTransactionsTraces';
import { getAddress } from './method/account/getAddress';
import { declareContract } from './method/contract/declareContract';
import { estimateAccountDeployFee } from './method/account/estimateAccountDeployFee';
import { signMessage } from './method/account/signMessage';
import { verifyMessage } from './method/account/verifyMessage';
import { createMemecoin } from './method/dapps/degen/unruggable/method/createMemecoin';
import { isMemecoin } from './method/dapps/degen/unruggable/method/isMemecoin';
import { getLockedLiquidity } from './method/dapps/degen/unruggable/method/getLockedLiquidity';
import { launchOnEkubo } from './method/dapps/degen/unruggable/method/launchOnEkubo';
import { RpcProvider } from 'starknet';
import { AccountManager } from 'src/lib/utils/account/AccountManager';
import { TransactionMonitor } from 'src/lib/utils/monitoring/TransactionMonitor';
import { ContractInteractor } from 'src/lib/utils/contract/ContractInteractor';
import { GetBalanceParams, GetOwnBalanceParams } from '../utils/types/balance';

export interface StarknetAgentInterface {
  getAccountCredentials: () => { 
    accountPublicKey: string;
    accountPrivateKey: string;
  };
  getModelCredentials: () => { 
    aiModel: string; 
    aiProviderApiKey: string;
  };
  getProvider: () => RpcProvider;
  accountManager: AccountManager;
  transactionMonitor: TransactionMonitor;
  contractInteractor: ContractInteractor;
}

interface StarknetTool<P = any> {
  name: string;
  description: string;
  schema?: object;
  execute: (agent: StarknetAgentInterface, params: P) => Promise<unknown>;
}

// Helper function to inject agent into tool methods
const withAgent = (fn: Function, agent: StarknetAgentInterface) => {
  return (...args: any[]) => fn(agent, ...args);
};

export class StarknetToolRegistry {
  private static tools: StarknetTool[] = [];

  static registerTool<P>(tool: StarknetTool<P>): void {
    this.tools.push(tool);
  }

  static createTools(agent: StarknetAgentInterface) {
    return this.tools.map(({ name, description, schema, execute }) => 
      tool(
        async (params: any) => execute(agent, params),
        { name, description, ...(schema && { schema }) }
      )
    );
  }
}

export const registerTools = () => {
  // Register balance tools
  StarknetToolRegistry.registerTool<GetOwnBalanceParams>({
    name: 'get_own_balance',
    description: 'Get the balance of an asset in your wallet',
    schema: getOwnBalanceSchema,
    execute: getOwnBalance
  });

  StarknetToolRegistry.registerTool<GetBalanceParams>({
    name: 'get_balance',
    description: 'Get the balance of an asset for a given wallet address',
    schema: getBalanceSchema,
    execute: getBalance
  });

  // Register account creation and deployment tools
  StarknetToolRegistry.registerTool({
    name: 'CreateOZAccount',
    description: 'Create Open Zeppelin account',
    execute: CreateOZAccount
  });

  StarknetToolRegistry.registerTool({
    name: 'DeployOZ',
    description: 'Deploy a OZ Account',
    schema: DeployOZAccountSchema,
    execute: DeployOZAccount
  });

  StarknetToolRegistry.registerTool({
    name: 'CreateArgentAccount',
    description: 'Create Account account',
    execute: CreateArgentAccount
  });

  StarknetToolRegistry.registerTool({
    name: 'DeployArgent',
    description: 'Deploy a Argent Account',
    schema: DeployArgentAccountSchema,
    execute: DeployArgentAccount
  });

  // Register blockchain query tools
  StarknetToolRegistry.registerTool({
    name: 'get_block_number',
    description: 'Get the current block number from the Starknet network',
    execute: getBlockNumber
  });

  StarknetToolRegistry.registerTool({
    name: 'get_block_transaction_count',
    description: 'Get the number of transactions in a specific block',
    schema: blockIdSchema,
    execute: getBlockTransactionCount
  });

  StarknetToolRegistry.registerTool({
    name: 'get_storage_at',
    description: 'Get the storage value at a specific slot for a contract',
    schema: getStorageAtSchema,
    execute: getStorageAt
  });

  // Register contract-related tools
  StarknetToolRegistry.registerTool({
    name: 'get_class',
    description: "Retrieve the complete class definition of a contract at a specified address and block",
    schema: blockIdAndContractAddressSchema,
    execute: getClass
  });

  StarknetToolRegistry.registerTool({
    name: 'get_class_at',
    description: "Fetch the class definition of a contract at a specific address in the latest state",
    schema: blockIdAndContractAddressSchema,
    execute: getClassAt
  });

  // Register DeFi tools
  StarknetToolRegistry.registerTool({
    name: 'swap_tokens',
    description: 'Swap a specified amount of one token for another token',
    schema: swapSchema,
    execute: swapTokens
  });

  StarknetToolRegistry.registerTool({
    name: 'get_route',
    description: 'Get a specific route for swapping tokens',
    schema: routeSchema,
    execute: getRoute
  });

  // Register transaction tools
  StarknetToolRegistry.registerTool({
    name: 'transfer',
    description: 'Transfer ERC20 tokens to a specific address',
    schema: Transferschema,
    execute: transfer
  });

  StarknetToolRegistry.registerTool({
    name: 'simulate_transaction',
    description: 'Simulate a transaction without executing it',
    schema: simulateInvokeTransactionSchema,
    execute: simulateInvokeTransaction
  });

  // Register memecoin tools
  StarknetToolRegistry.registerTool({
    name: 'create_memecoin',
    description: 'Create a new memecoin using the Unruggable Factory',
    schema: createMemecoinSchema,
    execute: createMemecoin
  });

  StarknetToolRegistry.registerTool({
    name: 'launch_on_ekubo',
    description: 'Launch a memecoin on Ekubo DEX with concentrated liquidity',
    schema: launchOnEkuboSchema,
    execute: launchOnEkubo
  });

  // Register utility tools
  StarknetToolRegistry.registerTool({
    name: 'get_chain_id',
    description: 'Retrieve the unique identifier (chain ID) of the Starknet network',
    execute: getChainId
  });

  StarknetToolRegistry.registerTool({
    name: 'get_syncing_status',
    description: 'Retrieve the syncing status of the Starknet node',
    execute: getSyncingStats
  });

  // Add remaining tools from createTools2
  StarknetToolRegistry.registerTool({
    name: 'get_class_hash',
    description: "Retrieve the unique class hash for a contract at a specific address",
    schema: blockIdAndContractAddressSchema,
    execute: getClassHashAt
  });

  StarknetToolRegistry.registerTool({
    name: 'get_spec_version',
    description: 'Get the current spec version from the Starknet RPC provider',
    execute: getSpecVersion
  });

  StarknetToolRegistry.registerTool({
    name: 'get_block_with_tx_hashes',
    description: 'Retrieve the details of a block, including transaction hashes',
    schema: blockIdSchema,
    execute: getBlockWithTxHashes
  });

  StarknetToolRegistry.registerTool({
    name: 'get_block_with_receipts',
    description: 'Fetch block details with transaction receipts',
    schema: blockIdSchema,
    execute: getBlockWithReceipts
  });

  StarknetToolRegistry.registerTool({
    name: 'get_transaction_status',
    description: 'Fetch transaction status by hash',
    schema: transactionHashSchema,
    execute: getTransactionStatus
  });

  // Transaction tools
  StarknetToolRegistry.registerTool({
    name: 'simulate_deploy_account_transaction',
    description: 'Simulate Deploy Account transaction',
    schema: simulateDeployAccountTransactionSchema,
    execute: simulateDeployAccountTransaction
  });

  StarknetToolRegistry.registerTool({
    name: 'simulate_deploy_transaction',
    description: 'Simulate Deploy transaction',
    schema: simulateDeployTransactionSchema,
    execute: simulateDeployTransaction
  });

  StarknetToolRegistry.registerTool({
    name: 'simulate_declare_transaction',
    description: 'Simulate Declare transaction',
    schema: simulateDeclareTransactionSchema,
    execute: simulateDeclareTransaction
  });

  // Utility tools
  StarknetToolRegistry.registerTool({
    name: 'is_memecoin',
    description: 'Check if address is a memecoin',
    schema: contractAddressSchema,
    execute: isMemecoin
  });

  StarknetToolRegistry.registerTool({
    name: 'get_locked_liquidity',
    description: 'Get locked liquidity info for token',
    schema: contractAddressSchema,
    execute: getLockedLiquidity
  });
};

// Initialize tools
registerTools();

export const createTools = (agent: StarknetAgentInterface) => {
  return StarknetToolRegistry.createTools(agent);
};

export default StarknetToolRegistry;