import { GetTransactionByBlockIdAndIndexParams } from 'src/lib/agent/schema';
import { rpcProvider } from 'src/lib/agent/starknetAgent';

export const getTransactionByBlockIdAndIndex = async (
  params: GetTransactionByBlockIdAndIndexParams
) => {
  try {
    const { transactionIndex, blockId } = params;
    const transaction = await rpcProvider.getTransactionByBlockIdAndIndex(
      blockId,
      transactionIndex
    );
    return JSON.stringify({
      status: 'success',
      transaction,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
