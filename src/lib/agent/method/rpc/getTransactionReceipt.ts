import { TransactionHashParams } from 'src/lib/agent/schema';
import { rpcProvider } from '../../../../lib/agent/starknetAgent';

export const getTransactionReceipt = async (params: TransactionHashParams) => {
  try {
    const { transactionHash } = params;
    const receipt = await rpcProvider.getTransactionReceipt(transactionHash);
    return JSON.stringify({
      status: 'success',
      receipt,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
