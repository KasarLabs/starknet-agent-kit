import { Contract } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC20_ABI } from '../abis/erc20Abi';
import { validateTokenAddress, formatBalance } from '../utils/token';
import { z } from 'zod';
import { getTotalSupplySchema } from '../schemas/schema';

/**
 * Gets the total supply of an ERC20 token.
 * @param {StarknetAgentInterface} agent - The Starknet agent interface
 * @param {string} symbol - The ERC20 token contract address
 * @returns {Promise<string>} JSON string with total supply
 * @throws {Error} If operation fails
 */
export const getTotalSupply = async (
  agent: StarknetAgentInterface,
  symbol: z.infer<typeof getTotalSupplySchema>
): Promise<string> => {
  try {
    if (!symbol) {
      throw new Error('Both asset symbol and account address are required');
    }

    symbol = symbol.toUpperCase();
    const tokenAddress = validateTokenAddress(symbol);

    const provider = agent.getProvider();
    const tokenContract = new Contract(ERC20_ABI, tokenAddress, provider);
    const totalSupply = await tokenContract.total_supply();

    const formattedSupply = formatBalance(totalSupply, symbol);

    return JSON.stringify({
      status: 'success',
      totalSupply: formattedSupply,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
