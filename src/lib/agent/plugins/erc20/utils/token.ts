import { tokenAddresses } from '../constant/erc20';

export const getTokenDecimals = (symbol: string): number => {
  const stablecoinSymbols = ['USDC', 'USDT'];
  const decimals = stablecoinSymbols.includes(symbol.toUpperCase()) ? 6 : 18;
  return decimals;
};

export const formatBalance = (
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
    console.log('Error formatting balance:', error);
    return '0';
  }
};

export const validateTokenAddress = (symbol: string): string => {
  const tokenAddress = tokenAddresses[symbol];
  if (!tokenAddress) {
    throw new Error(
      `Token ${symbol} not supported. Available tokens: ${Object.keys(tokenAddresses).join(', ')}`
    );
  }
  return tokenAddress;
};