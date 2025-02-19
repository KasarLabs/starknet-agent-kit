import { Contract, RpcProvider } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC20_ABI } from '../abis/erc20Abi';
import { formatBalance, validateTokenAddress } from '../utils/token';
import { z } from 'zod';
import { getAllowanceSchema } from '../schemas/schema';

/**
 * Gets the amount of tokens that a spender is allowed to spend on behalf of an owner.
 * @async
 * @function getAllowance
 * @param {StarknetAgentInterface} agent - The Starknet agent interface
 * @param {AllowanceParams} params - The owner, spender and token addresses
 * @returns {Promise<string>} JSON string with allowance amount
 * @throws {Error} If operation fails
 */
export const getAllowance = async (
  agent: StarknetAgentInterface,
  params: z.infer<typeof getAllowanceSchema>
): Promise<string> => {
  try {
    if (!params?.assetSymbol) {
      console.log('params', params);
      throw new Error('Both asset symbol and account address are required');
    }

    const tokenAddress = validateTokenAddress(params.assetSymbol);
    
    const provider = agent.getProvider();
    const ownerAddress = agent.getAccountCredentials().accountPublicKey;
    const tokenContract = new Contract(ERC20_ABI, tokenAddress, provider);

    const allowanceResponse = await tokenContract.allowance(ownerAddress, params.spenderAddress);

    const formattedAllowance = formatBalance(allowanceResponse, params.assetSymbol);

    return JSON.stringify({
      status: 'success',
      owner: ownerAddress,
      spender: params.spenderAddress,
      allowance: formattedAllowance,
    });
  } catch (error) {
    console.log('Error in getAllowance:', error);
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};