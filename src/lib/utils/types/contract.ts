import { CompiledContract } from 'starknet';

export type DeclareContractParams = {
  contract: CompiledContract;
  classHash?: string;
  compiledClassHash?: string;
};
