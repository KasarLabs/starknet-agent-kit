import { GetStorageParams } from 'src/lib/agent/schema';
import { StarknetAgentInterface } from '../../tools';

export const getStorageAt = async (
  agent: StarknetAgentInterface,
  params: GetStorageParams
) => {
  const provider = agent.getProvider();
  try {
    const storage = await provider.getStorageAt(
      params.contractAddress,
      params.key,
      params.blockId || 'latest'
    );

    return JSON.stringify({
      status: 'success',
      storage: storage.toString(),
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
