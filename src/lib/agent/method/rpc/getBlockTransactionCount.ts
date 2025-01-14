import { BlockIdParams } from 'src/lib/agent/schema';
import { rpcProvider } from '../../../../lib/agent/starknetAgent';
import { BlockNumber } from 'starknet';

export const getBlockTransactionCount = async (params?: BlockIdParams) => {
  try {
    let blockIdentifier: BlockNumber | string = params?.blockId || 'latest';

    if (
      typeof blockIdentifier === 'string' &&
      !isNaN(Number(blockIdentifier)) &&
      blockIdentifier !== 'latest'
    ) {
      blockIdentifier = Number(blockIdentifier);
    }

    const transactionCount =
      await rpcProvider.getBlockTransactionCount(blockIdentifier);

    return JSON.stringify({
      status: 'success',
      transactionCount: transactionCount.toString(),
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
