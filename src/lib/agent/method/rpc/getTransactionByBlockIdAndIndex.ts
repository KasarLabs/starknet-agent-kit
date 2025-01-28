import { GetTransactionByBlockIdAndIndexParams } from 'src/lib/agent/schema/schema';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';

export const getTransactionByBlockIdAndIndex = async (
  agent: StarknetAgentInterface,
  params: GetTransactionByBlockIdAndIndexParams
) => {
  const provider = agent.getProvider();

  try {
    const { transactionIndex, blockId } = params;
    const transaction = await provider.getTransactionByBlockIdAndIndex(
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
