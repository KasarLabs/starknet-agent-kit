import { Contract } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC20_ABI } from '../abis/erc20Abi';
import { validateTokenAddress, formatBalance } from '../utils/token';

/**
 * Gets the total supply of an ERC20 token.
 * @async
 * @function getTotalSupply
 * @param {StarknetAgentInterface} agent - The Starknet agent interface
 * @param {string} assetSymbol - The ERC20 token contract address
 * @returns {Promise<string>} JSON string with total supply
 * @throws {Error} If operation fails
 */
export const getTotalSupply = async (
  agent: StarknetAgentInterface,
  assetSymbol: string
): Promise<string> => {
  try {
    if (!assetSymbol ) {
      throw new Error('Both asset symbol and account address are required');
    }
    
    const tokenAddress = validateTokenAddress(assetSymbol);
    console.log('tokenAddress', tokenAddress);
    
    const provider = agent.getProvider();
    const tokenContract = new Contract(ERC20_ABI, tokenAddress, provider);
    const totalSupply = await tokenContract.total_supply();

    const formattedSupply = formatBalance(totalSupply, assetSymbol);
    console.log('formattedSupply', formattedSupply);
    console.log(typeof formattedSupply);

    return JSON.stringify({
      status: 'success',
      totalSupply: formattedSupply,
    });
  } catch (error) {
    console.log('Error in getTotalSupply:', error);
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};