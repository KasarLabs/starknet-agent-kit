import { RPC_URL, tokenAddresses } from 'src/lib/utils/constants/constant';
import { ERC20_ABI } from 'src/core/abis/tokens/erc20Abi';
import { Account, Contract, RpcProvider } from 'starknet';
import {
  GetOwnBalanceParams,
  GetBalanceParams,
} from 'src/lib/utils/types/balance';
import { StarknetAgent } from '../../starknetAgent';
import { StarknetAgentInterface } from '../../tools';

const provider = new RpcProvider({ nodeUrl: RPC_URL });

const getTokenDecimals = (symbol: string): number => {
  const stablecoinSymbols = ['USDC', 'USDT'];
  return stablecoinSymbols.includes(symbol.toUpperCase()) ? 6 : 18;
};

const formatBalance = (rawBalance: string, symbol: string): string => {
  const decimals = getTokenDecimals(symbol);
  const balancePadded = rawBalance.padStart(decimals + 1, '0');
  const decimalPosition = balancePadded.length - decimals;
  const formattedBalance =
    balancePadded.slice(0, decimalPosition) +
    '.' +
    balancePadded.slice(decimalPosition);
  return parseFloat(formattedBalance).toString();
};

export const getOwnBalance = async (
  agent: StarknetAgentInterface,
  params: GetOwnBalanceParams
): Promise<string> => {
  try {
    const accountCredentials = agent.getAccountCredentials();
    const accountAddress = accountCredentials?.accountPublicKey;
    const accountPrivateKey = accountCredentials?.accountPrivateKey;

    if (!accountAddress) {
      throw new Error('Wallet address not configured');
    }
    const account = new Account(provider, accountAddress, accountPrivateKey);

    const tokenAddress = tokenAddresses[params.symbol];
    if (!tokenAddress) {
      throw new Error(`Token ${params.symbol} not supported`);
    }

    const tokenContract = new Contract(ERC20_ABI, tokenAddress, provider);

    const balance = await tokenContract.balanceOf(account.address);
    const formattedBalance = formatBalance(
      balance.balance.toString(),
      params.symbol
    );

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

export const getBalance = async (
  agent: StarknetAgentInterface, 
  params: GetBalanceParams
): Promise<string> => {
  try {
    const tokenAddress = tokenAddresses[params.assetSymbol];
    if (!tokenAddress) {
      throw new Error(`Token ${params.assetSymbol} not supported`);
    }

    const tokenContract = new Contract(ERC20_ABI, tokenAddress, provider);
    const balance = await tokenContract.balanceOf(params);

    const formattedBalance = formatBalance(
      balance.balance.toString(),
      params.assetSymbol
    );

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
