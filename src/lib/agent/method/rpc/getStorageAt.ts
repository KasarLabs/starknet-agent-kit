import { GetStorageParams } from 'src/lib/agent/schema';
import { RPC_URL } from 'src/lib/utils/constants/constant';
import { RpcProvider } from 'starknet';

// Initialize provider
const provider = new RpcProvider({ nodeUrl: RPC_URL });

export const getStorageAt = async (params: GetStorageParams) => {
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
