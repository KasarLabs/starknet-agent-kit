import { rpcProvider } from '../../../../lib/agent/starknetAgent';

export const getSyncingStats = async () => {
  try {
    const syncingStats = await rpcProvider.getSyncingStats();
    return JSON.stringify({
      status: 'success',
      syncingStats,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
