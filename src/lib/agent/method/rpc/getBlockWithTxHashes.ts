import { BlockIdParams } from 'src/lib/agent/schema';
import { StarknetAgentInterface } from 'src/lib/agent/tools';

export const getBlockWithTxHashes = async (
  agent: StarknetAgentInterface,
  params: BlockIdParams
) => {
  try {
    const provider = agent.getProvider();
    const blockId = params?.blockId ?? 'latest';
    const block = await provider.getBlockWithTxHashes(blockId);
    return JSON.stringify({
      status: 'success',
      block,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
