import { rpcProvider } from 'src/lib/agent/starknetAgent';

export const getBlockLatestAccepted = async () => {
  try {
    const blockHashAndNumber = await rpcProvider.getBlockLatestAccepted();

    return JSON.stringify({
      status: 'success',
      blockHashAndNumber,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
