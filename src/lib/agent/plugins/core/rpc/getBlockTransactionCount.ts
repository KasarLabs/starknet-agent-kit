import { BlockIdParams } from 'src/lib/agent/schemas/schema';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';

export const getBlockTransactionCount = async (
  agent: StarknetAgentInterface,
  params: BlockIdParams
) => {
  const provider = agent.getProvider();
  return await provider.getBlockTransactionCount(params.blockId);
};
