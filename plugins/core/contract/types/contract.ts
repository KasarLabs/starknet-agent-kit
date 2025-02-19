import { CompiledContract } from 'starknet';

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
