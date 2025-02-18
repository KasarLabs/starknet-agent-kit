import { Account, Contract, uint256 } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC20_ABI } from '../abis/erc20Abi';

export interface TransferFromParams {
  fromAddress: string;
  toAddress: string;
  amount: string;
  tokenAddress: string;
}

/**
 * Transfers tokens from one address to another using an allowance.
 * @async
 * @function transferFrom
 * @param {StarknetAgentInterface} agent - The Starknet agent interface
 * @param {TransferFromParams} params - Transfer parameters
 * @returns {Promise<string>} JSON string with transaction result
 * @throws {Error} If transfer fails
 */
export const transferFrom = async (
  agent: StarknetAgentInterface,
  params: TransferFromParams
): Promise<string> => {
  try {
    const provider = agent.getProvider();
    const accountCredentials = agent.getAccountCredentials();
    
    const account = new Account(
      provider,
      accountCredentials.accountPublicKey,
      accountCredentials.accountPrivateKey
    );

    const contract = new Contract(ERC20_ABI, params.tokenAddress, provider);
    contract.connect(account);

    const { transaction_hash } = await contract.transferFrom(
      params.fromAddress,
      params.toAddress,
      uint256.bnToUint256(params.amount)
    );

    await provider.waitForTransaction(transaction_hash);

    return JSON.stringify({
      status: 'success',
      transactionHash: transaction_hash,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};