import { BlockIdParams } from '../schema';
import { StarknetAgentInterface } from 'agents/agent/tools/tools';

export const getBlockWithReceipts = async (
  agent: StarknetAgentInterface,
  params: BlockIdParams
) => {
  try {
    const provider = agent.getProvider();
    const blockId = params?.blockId ?? 'latest';
    const block = await provider.getBlockWithReceipts(blockId);
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
