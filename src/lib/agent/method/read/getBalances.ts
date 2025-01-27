import { tokenAddresses } from 'src/core/constants/tokens/erc20';
import { ERC20_ABI } from 'src/core/abis/tokens/erc20Abi';
import { Account, Contract, RpcProvider } from 'starknet';
import {
  GetOwnBalanceParams,
  GetBalanceParams,
} from 'src/lib/utils/types/balance';
import { StarknetAgentInterface } from 'src/lib/agent/tools';
import { response } from 'express';

const getTokenDecimals = (symbol: string): number => {
  const stablecoinSymbols = ['USDC', 'USDT'];
  const decimals = stablecoinSymbols.includes(symbol.toUpperCase()) ? 6 : 18;
  return decimals;
};

const formatBalance = (
  rawBalance: bigint | string | number,
  symbol: string
): string => {
  try {
    const balanceStr =
      typeof rawBalance === 'bigint'
        ? rawBalance.toString()
        : String(rawBalance);

    if (!balanceStr || balanceStr === '0') {
      return '0';
    }

    const decimals = getTokenDecimals(symbol);

    if (balanceStr.length <= decimals) {
      const zeros = '0'.repeat(decimals - balanceStr.length);
      const formattedBalance = `0.${zeros}${balanceStr}`;
      return formattedBalance;
    }

    const decimalPosition = balanceStr.length - decimals;
    const wholePart = balanceStr.slice(0, decimalPosition) || '0';
    const fractionalPart = balanceStr.slice(decimalPosition);
    const formattedBalance = `${wholePart}.${fractionalPart}`;

    return formattedBalance;
  } catch (error) {
    console.error('Error formatting balance:', error);
    return '0';
  }
};

const validateTokenAddress = (symbol: string): string => {
  const tokenAddress = tokenAddresses[symbol];
  if (!tokenAddress) {
    throw new Error(
      `Token ${symbol} not supported. Available tokens: ${Object.keys(tokenAddresses).join(', ')}`
    );
  }
  return tokenAddress;
};

export const getOwnBalance = async (
  agent: StarknetAgentInterface,
  params: GetOwnBalanceParams
): Promise<string> => {
  try {
    if (!params?.symbol) {
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
    const tokenAddress = validateTokenAddress(params.symbol);
    const tokenContract = new Contract(ERC20_ABI, tokenAddress, provider);

    const balanceResponse = await tokenContract.balanceOf(account.address);

    const balanceValue = balanceResponse;

    if (balanceValue === undefined || balanceValue === null) {
      throw new Error('No balance value received from contract');
    }

    const formattedBalance = formatBalance(balanceValue, params.symbol);

    return JSON.stringify({
      status: 'success',
      balance: formattedBalance,
    });
  } catch (error) {
    console.error('Error in getOwnBalance:', error);
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
    });
  }
};

export const getBalance = async (
  agent: StarknetAgentInterface,
  params: GetBalanceParams
): Promise<string> => {
  try {
    if (!params?.assetSymbol || !params?.accountAddress) {
      throw new Error('Both assetSymbol and address parameters are required');
    }

    const provider = agent.getProvider();

    const tokenAddress = validateTokenAddress(params.assetSymbol);
    const tokenContract = new Contract(ERC20_ABI, tokenAddress, provider);

    const balanceResponse = await tokenContract.balanceOf(
      params.accountAddress
    );

    if (!balanceResponse || typeof balanceResponse !== 'object') {
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
    console.error('Error in getBalance:', error);
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
    });
  }
};
