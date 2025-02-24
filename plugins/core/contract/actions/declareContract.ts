import { Account } from 'starknet';
import { DeclareContractParams } from '@plugins/core/contract/types/contract';
import { StarknetAgentInterface } from '@starknet-agent-kit/agents';

/**
 * Declares a new contract on Starknet
 * @param {DeclareContractParams} params - Contract declaration parameters
 * @param {StarknetAgentInterface} agent - Starknet agent interface
 * @returns {Promise<string>} JSON string with transaction result or error
 */
export const declareContract = async (
  params: DeclareContractParams,
  agent: StarknetAgentInterface
) => {
  try {
    const provider = agent.getProvider();
    const accountCredentials = agent.getAccountCredentials();
    const accountAddress = accountCredentials?.accountPublicKey;
    const accountPrivateKey = accountCredentials?.accountPrivateKey;
    if (!accountAddress) {
      throw new Error('Account address not configured');
    }

    const { contract, classHash, compiledClassHash } = params;

    const account = new Account(provider, accountAddress, accountPrivateKey);

    const declareResponse = await account.declare({
      contract,
      classHash,
      compiledClassHash,
    });

    await provider.waitForTransaction(declareResponse.transaction_hash);

    return JSON.stringify({
      status: 'success',
      transactionHash: declareResponse.transaction_hash,
      classHash: declareResponse.class_hash,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
