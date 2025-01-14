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

// Types
type StarknetAgentInterface = {
  getCredentials: () => { walletPrivateKey: string };
};

/**
 * Wraps a function to inject the wallet private key from the agent
 */
const withWalletKey = <T>(
  fn: (params: T, privateKey: string) => Promise<unknown>,
  agent: StarknetAgentInterface
) => {
  return (params: T) => fn(params, agent.getCredentials().walletPrivateKey);
};
/**
 * Creates and returns balance checking tools with injected agent credentials
 */
export const createTools = (agent: StarknetAgentInterface) => [
  tool(withWalletKey(getOwnBalance, agent), {
    name: 'get_own_balance',
    description: 'Get the balance of an asset in your wallet',
    schema: getOwnBalanceSchema,
  }),
  tool(getBalance, {
    name: 'get_balance',
    description: 'Get the balance of an asset for a given wallet address',
    schema: getBalanceSchema,
  }),
  tool(CreateOZAccount, {
    name: 'CreateOZAccount',
    description: 'Create Open Zeppelin account',
  }),
  tool(DeployOZAccount, {
    name: 'DeployOZ',
    description: 'Deploy a OZ Account',
    schema: DeployOZAccountSchema,
  }),
  tool(CreateArgentAccount, {
    name: 'CreateArgentAccount',
    description: 'Create Account account',
  }),
  tool(DeployArgentAccount, {
    name: 'DeployArgent',
    description: 'Deploy a Argent Account',
    schema: DeployArgentAccountSchema,
  }),
  tool(getBlockNumber, {
    name: 'get_block_number',
    description: 'Get the current block number from the Starknet network',
  }),
  tool(getBlockTransactionCount, {
    name: 'get_block_transaction_count',
    description: 'Get the number of transactions in a specific block',
    schema: blockIdSchema,
  }),
  tool(getStorageAt, {
    name: 'get_storage_at',
    description: 'Get the storage value at a specific slot for a contract',
    schema: getStorageAtSchema,
  }),
  tool(getClass, {
    name: 'get_class',
    description:
      "Retrieve the complete class definition of a contract at a specified address and block. This includes the contract's structure, methods, and other metadata.",
    schema: blockIdAndContractAddressSchema,
  }),
  tool(getClassAt, {
    name: 'get_class_at',
    description:
      "Fetch the class definition of a contract at a specific address in the latest state. This provides details about the contract's layout and capabilities.",
    schema: blockIdAndContractAddressSchema,
  }),
  tool(getClassHashAt, {
    name: 'get_class_hash',
    description:
      "Retrieve the unique class hash for a contract at a specific address. The class hash acts as an identifier for the contract's blueprint.",
    schema: blockIdAndContractAddressSchema,
  }),
  tool(withWalletKey(swapTokens, agent), {
    name: 'swap_tokens',
    description:
      'Swap a specified amount of one token for another token. Always return the transaction hash if successful',
    schema: swapSchema,
  }),
  tool(getRoute, {
    name: 'get_route',
    description:
      'Get a specific route for swapping tokens. This is useful for determining the best path for a token swap.',
    schema: routeSchema,
  }),
  tool(transfer, {
    name: 'transfer',
    description:
      'transfer from the caller only token ERC20 at a specific public address',
    schema: Transferschema,
  }),
  tool(getSpecVersion, {
    name: 'get_spec_version',
    description: 'Get the current spec version from the Starknet RPC provider',
  }),
  tool(getBlockWithTxHashes, {
    name: 'get_block_with_tx_hashes',
    description:
      'Retrieve the details of a block, including a list of transaction hashes, based on the specified block identifier. This is useful for tracking which transactions are included in a block.',
    schema: blockIdSchema,
  }),
  tool(getBlockWithTxs, {
    name: 'get_block_with_txs',
    description:
      'Retrieve a block’s details along with full transaction data, including the sender, recipient, and other transaction-specific details. This method is ideal when you need comprehensive information on the transactions included in a block.',
    schema: blockIdSchema,
  }),
  tool(getBlockWithReceipts, {
    name: 'get_block_with_receipts',
    description:
      'Fetch the details of a block along with transaction receipts, which include the status and logs of each transaction in the block. Use this when you need to check transaction outcomes and event logs.',
    schema: blockIdSchema,
  }),
  tool(getBlockStateUpdate, {
    name: 'get_block_state_update',
    description:
      'Fetch the state update for a block, using a specified block identifier.',
    schema: blockIdSchema,
  }),
  tool(getTransactionStatus, {
    name: 'get_transaction_status',
    description:
      'Fetch the status of a specific transaction by providing its transaction hash. This includes information such as whether the transaction succeeded or failed.',
    schema: transactionHashSchema,
  }),
  tool(getTransactionByHash, {
    name: 'get_transaction_by_hash',
    description:
      'Retrieve the full details of a specific transaction by providing its transaction hash. This includes data such as the sender, recipient, and the value transferred.',
    schema: transactionHashSchema,
  }),
  tool(getTransactionByBlockIdAndIndex, {
    name: 'get_transaction_by_block_id_and_index',
    description:
      'Retrieve a specific transaction from a block by providing the block identifier and the transaction index within the block.',
    schema: getTransactionByBlockIdAndIndexSchema,
  }),
  tool(getTransactionReceipt, {
    name: 'get_transaction_receipt',
    description:
      'Retrieve the receipt of a specific transaction by providing its transaction hash. This includes transaction status and other important details.',
    schema: transactionHashSchema,
  }),
  tool(getBlockLatestAccepted, {
    name: 'get_latest_accepted_block',
    description:
      "Retrieve the latest accepted block's hash and number from the Starknet network.",
  }),
  tool(getChainId, {
    name: 'get_chain_id',
    description:
      'Retrieve the unique identifier (chain ID) of the Starknet network.',
  }),
  tool(getSyncingStats, {
    name: 'get_syncing_status',
    description:
      'Retrieve the syncing status of the Starknet node, including the current block, highest block, and starting block if syncing.',
  }),
  tool(getNonceForAddress, {
    name: 'get_nonce_for_address',
    description:
      'Retrieve the nonce for a specific contract or account address at a specified block.',
    schema: blockIdAndContractAddressSchema,
  }),
  tool(getTransactionTrace, {
    name: 'get_transaction_trace',
    description:
      'Fetch the execution trace for a specific transaction, including details about function calls and other internal operations.',
    schema: transactionHashSchema,
  }),
  tool(getBlockTransactionsTraces, {
    name: 'get_block_transactions_traces',
    description:
      'Retrieve execution traces for all transactions in a specified block, including detailed insights into their execution.',
    schema: blockIdSchema,
  }),
  tool(getAddress, {
    name: 'get_address',
    description:
      'Returns the public (current) account address from your .env config',
  }),
  tool(withWalletKey(declareContract, agent), {
    name: 'declare_contract',
    description: 'Declare a new contract on Starknet',
    schema: declareContractSchema,
  }),
  tool(withWalletKey(estimateAccountDeployFee, agent), {
    name: 'estimate_account_deploy_fee',
    description: 'Estimate the fee required to deploy an account',
    schema: estimateAccountDeployFeeSchema,
  }),

  tool(withWalletKey(signMessage, agent), {
    name: 'sign_message',
    description: 'Sign a typed data message',
    schema: signMessageSchema,
  }),

  tool(verifyMessage, {
    name: 'verify_message',
    description: 'Verify a signed message',
    schema: verifyMessageSchema,
  }),
  tool(withWalletKey(simulateInvokeTransaction, agent), {
    name: 'simulate_transaction',
    description: 'Simulate a transaction without executing it',
    schema: simulateInvokeTransactionSchema,
  }),
  tool(withWalletKey(simulateDeployAccountTransaction, agent), {
    name: 'simulate_deploy_account_transaction',
    description: 'Simulate Deploy Account transaction without executing it',
    schema: simulateDeployAccountTransactionSchema,
  }),
  tool(withWalletKey(simulateDeployTransaction, agent), {
    name: 'simulate_deploy_transaction',
    description: 'Simulate Deploy transaction without executing it',
    schema: simulateDeployTransactionSchema,
  }),
  tool(withWalletKey(simulateDeclareTransaction, agent), {
    name: 'simulate_declare_transaction',
    description: 'Simulate Deploy transaction without executing it',
    schema: simulateDeclareTransactionSchema,
  }),
];
