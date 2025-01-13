import { RPC_URL, tokenAddresses } from 'src/lib/constant';
import { Account, Contract, RpcProvider } from 'starknet';

// Initialize provider
const provider = new RpcProvider({ nodeUrl: RPC_URL });

export type GetOwnBalanceParams = {
  symbol: string;
};

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

    // Account Instance
    const account = new Account(provider, walletAddress, privateKey);

    const tokenAddress = tokenAddresses[params.symbol];
    if (!tokenAddress) {
      throw new Error(`Token ${params.symbol} not supported`);
    }

    const tokenContract = new Contract(erc20ABI, tokenAddress, provider);

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

export type GetBalanceParams = {
  walletAddress: string;
  assetSymbol: string;
};

export const getBalance = async (params: GetBalanceParams) => {
  try {
    const tokenAddress = tokenAddresses[params.assetSymbol];
    if (!tokenAddress) {
      throw new Error(`Token ${params.assetSymbol} not supported`);
    }

    const tokenContract = new Contract(erc20ABI, tokenAddress, provider);
    const balance = await tokenContract.balanceOf(params.walletAddress);
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

// Basic ERC20 ABI for balanceOf
const erc20ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [
      {
        name: 'account',
        type: 'felt',
      },
    ],
    outputs: [
      {
        name: 'balance',
        type: 'Uint256',
      },
    ],
    stateMutability: 'view',
  },
];
