import { BlockIdParams } from 'src/lib/agent/schema';
import { rpcProvider } from '../../../../lib/agent/starknetAgent';

export const getBlockWithTxHashes = async (params: BlockIdParams) => {
  try {
    const blockId = params?.blockId ?? 'latest';
    const block = await rpcProvider.getBlockWithTxHashes(blockId);
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
