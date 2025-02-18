import { RpcProvider } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { AccountManager } from '../utils/AccountManager';
import { z } from 'zod';
import { accountDetailsSchema } from '../schemas/schema';
import {
  braavos_account_classhash,
  braavos_initial_classhash,
  braavos_proxy_classhash,
} from '../constant/contract';

/**
 * Deploys a Braavos account using a Starknet agent.
 * @async
 * @function DeployBraavosAccount
 * @param {StarknetAgentInterface} agent - The Starknet agent interface
 * @param {z.infer<typeof accountDetailsSchema>} params - Account details
 * @returns {Promise<string>} JSON string with deployment status and transaction details
 * @throws {Error} If deployment fails
 */
export const DeployBraavosAccount = async (
  agent: StarknetAgentInterface,
  params: z.infer<typeof accountDetailsSchema>
) => {
  try {
    const provider = agent.getProvider();

    const accountManager = new AccountManager(
      provider,
      braavos_initial_classhash,
      braavos_proxy_classhash,
      braavos_account_classhash
    );

    const tx = await accountManager.deployAccount(params);

    console.log('✅ Braavos wallet deployed at:', tx.contractAddress);
    console.log('✅ Transaction hash:', tx.transactionHash);

    return JSON.stringify({
      status: 'success',
      wallet: 'Braavos',
      transaction_hash: tx.transactionHash,
      contract_address: tx.contractAddress,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Deploys a Braavos account using direct RPC connection.
 * @async
 * @function DeployBraavosAccountSignature
 * @param {z.infer<typeof accountDetailsSchema>} params - Account details
 * @returns {Promise<string>} JSON string with deployment status and transaction details
 * @throws {Error} If deployment fails
 */
export const DeployBraavosAccountSignature = async (
  params: z.infer<typeof accountDetailsSchema>
) => {
  try {
    const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });

    const accountManager = new AccountManager(
      provider,
      braavos_initial_classhash,
      braavos_proxy_classhash,
      braavos_account_classhash
    );

    const tx = await accountManager.deployAccount(params);

    console.log('✅ Braavos wallet deployed at:', tx.contractAddress);
    console.log('✅ Transaction hash:', tx.transactionHash);

    return JSON.stringify({
      status: 'success',
      wallet: 'Braavos',
      transaction_hash: tx.transactionHash,
      contract_address: tx.contractAddress,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
