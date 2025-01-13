import { BlockIdParams } from 'src/lib/agent/schema';
import { rpcProvider } from 'src/lib/agent/starknetAgent';

export const getBlockTransactionsTraces = async (params: BlockIdParams) => {
  try {
    const { blockId } = params;
    const transactionTraces =
      await rpcProvider.getBlockTransactionsTraces(blockId);
    return JSON.stringify({
      status: 'success',
      transactionTraces,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
