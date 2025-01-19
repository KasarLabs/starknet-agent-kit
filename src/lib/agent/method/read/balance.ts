import { RPC_URL, tokenAddresses } from 'src/lib/utils/constants/constant';
import { ERC20_ABI } from 'src/core/abis/tokens/erc20Abi';
import { Account, Contract, RpcProvider } from 'starknet';
import {
  GetOwnBalanceParams,
  GetBalanceParams,
} from 'src/lib/utils/types/balance';

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
  params: GetOwnBalanceParams,
  privateKey: string
) => {
  try {
    const walletAddress = process.env.PUBLIC_ADDRESS;

    if (!walletAddress) {
      throw new Error('Wallet address not configured');
    }

    const account = new Account(provider, walletAddress, privateKey);

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

export const getBalance = async (params: GetBalanceParams) => {
  try {
    console.log(RPC_URL, provider);
    console.log(params);
    const tokenAddress = tokenAddresses[params.assetSymbol];
    if (!tokenAddress) {
      throw new Error(`Token ${params.assetSymbol} not supported`);
    }

    const tokenContract = new Contract(ERC20_ABI, tokenAddress, provider);
    const balance = await tokenContract.balanceOf(params.walletAddress);
    console.log('it work');
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
