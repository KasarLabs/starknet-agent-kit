import { TransactionHashParams } from 'src/lib/agent/schema';
import { StarknetAgentInterface } from 'src/lib/agent/tools';

export const getTransactionByHash = async (
  agent: StarknetAgentInterface,
  params: TransactionHashParams
) => {
  const provider = agent.getProvider();

  try {
    const { transactionHash } = params;
    const transaction = await provider.getTransactionByHash(transactionHash);
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
