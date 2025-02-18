import { CompiledContract } from 'starknet';
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


/**
 * Parameters for declaring a contract
 * @property {CompiledContract} contract - The compiled contract to be declared
 * @property {string} [classHash] - Optional hash of the contract class
 * @property {string} [compiledClassHash] - Optional hash of the compiled contract class
 */
export type DeclareContractParams = {
  contract: CompiledContract;
  classHash?: string;
  compiledClassHash?: string;
};

/**
 * Result of a contract deployment
 * @property {string} transactionHash - Hash of the deployment transaction
 * @property {string | string[]} contractAddress - Address(es) of the deployed contract(s)
 */
export interface ContractDeployResult {
  transactionHash: string;
  contractAddress: string | string[];
}

