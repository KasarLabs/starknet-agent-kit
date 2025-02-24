import { StarknetAgentInterface } from '@starknet-agent-kit/agents';
import { ProviderInterface } from 'starknet';

/**
 * Details of a Starknet account
 * @property {string} address - The account's address
 * @property {string} privateKey - The account's private key
 * @property {string} publicKey - The account's public key
 * @property {boolean} deployStatus - Whether the account has been deployed
 */
export interface AccountDetails {
  contractAddress: string;
  publicKey: string;
  privateKey: string;
}

/**
 * Result of a transaction operation
 * @property {('success'|'failure')} status - Status of the transaction
 * @property {string} [transactionHash] - Hash of the executed transaction
 * @property {string} [error] - Error message if transaction failed
 */
export interface TransactionResult {
  status: 'success' | 'failure';
  transactionHash?: string;
  contractAddress?: string;
  error?: string;
}

/**
 * Base class for utility functions
 * @property {ProviderInterface} provider - The Starknet provider instance
 */
export interface BaseUtilityClass {
  provider: ProviderInterface;
}
