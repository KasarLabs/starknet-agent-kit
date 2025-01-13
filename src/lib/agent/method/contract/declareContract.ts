// method/contract/declareContract.ts
import { Contract, Account, CompiledContract } from 'starknet';
import { rpcProvider } from '../../starknetAgent';

export type DeclareContractParams = {
  contract: CompiledContract;
  classHash?: string;
  compiledClassHash?: string;
};

export const declareContract = async (
  params: DeclareContractParams,
  privateKey: string
) => {
  try {
    const accountAddress = process.env.PUBLIC_ADDRESS;
    if (!accountAddress) {
      throw new Error('Account address not configured');
    }

    const { contract, classHash, compiledClassHash } = params;

    const account = new Account(rpcProvider, accountAddress, privateKey);

    const declareResponse = await account.declare({
      contract,
      classHash,
      compiledClassHash,
    });

    await rpcProvider.waitForTransaction(declareResponse.transaction_hash);

    return JSON.stringify({
      status: 'success',
      transactionHash: declareResponse.transaction_hash,
      classHash: declareResponse.class_hash,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
