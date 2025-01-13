import { TransactionHashParams } from 'src/lib/agent/schema';
import { rpcProvider } from 'src/lib/agent/starknetAgent';

export const getTransactionTrace = async (params: TransactionHashParams) => {
  try {
    const { transactionHash } = params;
    const transactionTrace =
      await rpcProvider.getTransactionTrace(transactionHash);
    return JSON.stringify({
      status: 'success',
      transactionTrace,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
