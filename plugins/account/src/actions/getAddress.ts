import { StarknetAgentInterface } from '@starknet-agent-kit/agent';

/**
 * Retrieves the Starknet account address from agent credentials
 * @param {StarknetAgentInterface} agent - Starknet agent interface
 * @returns {Promise<string>} JSON string with account address or error
 */
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
