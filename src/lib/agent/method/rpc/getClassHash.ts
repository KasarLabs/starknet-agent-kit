import { BlockIdAndContractAddressParams } from 'src/lib/agent/schema';
import { rpcProvider } from 'src/lib/agent/starknetAgent';
import { BlockNumber } from 'starknet';

export const getClassHashAt = async (
  params: BlockIdAndContractAddressParams
) => {
  try {
    let blockIdentifier: BlockNumber | string = params.blockId || 'latest';

    if (
      typeof blockIdentifier === 'string' &&
      !isNaN(Number(blockIdentifier)) &&
      blockIdentifier !== 'latest'
    ) {
      blockIdentifier = Number(blockIdentifier);
    }

    // Note the order of parameters for getClassHashAt is different from getClassAt!
    const classHash = await rpcProvider.getClassHashAt(
      params.contractAddress,
      blockIdentifier
    );

    return JSON.stringify({
      status: 'success',
      classHash,
    });
  } catch (error) {
    console.error('GetClassHash error:', error);
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
