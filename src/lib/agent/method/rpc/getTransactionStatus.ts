import { TransactionHashParams } from 'src/lib/agent/schema';
import { rpcProvider } from '../../../../lib/agent/starknetAgent';

export const getTransactionStatus = async (params: TransactionHashParams) => {
  try {
    const { transactionHash } = params;
    const status = await rpcProvider.getTransactionStatus(transactionHash);
    return JSON.stringify({
      status: 'success',
      blockStatus: status,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
