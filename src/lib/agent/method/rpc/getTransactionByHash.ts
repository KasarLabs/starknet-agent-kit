import { TransactionHashParams } from 'src/lib/agent/schema';
import { rpcProvider } from 'src/lib/agent/starknetAgent';

export const getTransactionByHash = async (params: TransactionHashParams) => {
  try {
    const { transactionHash } = params;
    const transaction = await rpcProvider.getTransactionByHash(transactionHash);
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
