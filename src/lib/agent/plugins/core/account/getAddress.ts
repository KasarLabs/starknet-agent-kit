import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';

export const getAddress = async (agent: StarknetAgentInterface) => {
  try {
    const accountAddress = agent.getAccountCredentials()?.accountPublicKey;

    if (!accountAddress) {
      throw new Error(
        'No public address found. Please set STARKNET_PUBLIC_ADDRESS in your .env file!'
      );
    }

    return JSON.stringify({
      status: 'success',
      accountAddress,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
