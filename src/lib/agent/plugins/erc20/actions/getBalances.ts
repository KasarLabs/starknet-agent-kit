import { Account, Contract, RpcProvider } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC20_ABI } from '../abis/erc20Abi';
import { formatBalance, validateTokenAddress } from '../utils/token';
import { z } from 'zod';
import { getBalanceSchema, getOwnBalanceSchema } from '../schemas/schema';

/**
 * Gets own token balance
 * @param {StarknetAgentInterface} agent - The Starknet agent interface
 * @param {OwnBalanceParams} params - Balance parameters
 * @returns {Promise<string>} JSON string with balance amount
 * @throws {Error} If operation fails
 */
export const getOwnBalance = async (
  agent: StarknetAgentInterface,
  params: z.infer<typeof getOwnBalanceSchema>
): Promise<string> => {
  try {
    if (!params?.assetSymbol) {
      throw new Error('Symbol parameter is required');
    }

    const provider = agent.getProvider();
    const accountCredentials = agent.getAccountCredentials();

    const accountAddress = accountCredentials?.accountPublicKey;
    const accountPrivateKey = accountCredentials?.accountPrivateKey;

    if (!accountAddress) {
      throw new Error('Wallet address not configured');
    }

    const account = new Account(provider, accountAddress, accountPrivateKey);
    const tokenAddress = validateTokenAddress(params.assetSymbol);
    const tokenContract = new Contract(ERC20_ABI, tokenAddress, provider);

    const balanceResponse = await tokenContract.balanceOf(account.address);

    const balanceValue = balanceResponse;

    if (balanceValue === undefined || balanceValue === null) {
      throw new Error('No balance value received from contract');
    }

    const formattedBalance = formatBalance(balanceValue, params.assetSymbol);

    return JSON.stringify({
      status: 'success',
      balance: formattedBalance,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Gets token balance for an address
 * @param {StarknetAgentInterface} agent - The Starknet agent interface
 * @param {BalanceParams} params - Balance parameters
 * @returns {Promise<string>} JSON string with balance amount
 * @throws {Error} If operation fails
 */
export const getBalance = async (
  agent: StarknetAgentInterface,
  params: z.infer<typeof getBalanceSchema>
): Promise<string> => {
  try {
    if (!params?.assetSymbol || !params?.accountAddress) {
      throw new Error('Both asset symbol and account address are required');
    }

    const tokenAddress = validateTokenAddress(params.assetSymbol);

    const provider = agent.getProvider();
    const tokenContract = new Contract(ERC20_ABI, tokenAddress, provider);
    const balanceResponse = await tokenContract.balanceOf(
      params.accountAddress
    );

    if (!balanceResponse && typeof balanceResponse !== 'object') {
      console.log('here');
      throw new Error('Invalid balance response format from contract');
    }

    const balanceValue =
      typeof balanceResponse === 'object' && 'balance' in balanceResponse
        ? balanceResponse.balance
        : balanceResponse;

    const formattedBalance = formatBalance(balanceValue, params.assetSymbol);

    return JSON.stringify({
      status: 'success',
      balance: formattedBalance,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Generates balance check signature
 * @param {BalanceParams} params - Balance parameters
 * @returns {Promise<string>} JSON string with balance amount
 * @throws {Error} If operation fails
 */
export const getBalanceSignature = async (
  params: z.infer<typeof getBalanceSchema>
): Promise<string> => {
  try {
    if (!params?.assetSymbol || !params?.accountAddress) {
      throw new Error('Both asset symbol and account address are required');
    }

    const symbol = params.assetSymbol.toUpperCase();
    const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });

    const tokenAddress = validateTokenAddress(symbol);
    const tokenContract = new Contract(ERC20_ABI, tokenAddress, provider);

    const balanceResponse = await tokenContract.balanceOf(
      params.accountAddress
    );

    if (!balanceResponse || typeof balanceResponse !== 'bigint') {
      throw new Error('Invalid balance response format from contract');
    }

    const formattedBalance = formatBalance(balanceResponse, symbol);
    return JSON.stringify({
      status: 'success',
      transaction_type: 'READ',
      balance: formattedBalance,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
    });
  }
};
