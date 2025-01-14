import { RPC_URL } from '../../../../lib/constant';
import { RpcProvider } from 'starknet';

const provider = new RpcProvider({ nodeUrl: RPC_URL });

export const getSpecVersion = async () => {
  try {
    const specVersion = await provider.getSpecVersion();

    return JSON.stringify({
      status: 'success',
      specVersion: specVersion.toString(),
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
