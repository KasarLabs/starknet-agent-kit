import { tokenAddresses } from '../constant/erc20';
import { DECIMALS } from '../types/types';
import { BigNumberish, uint256 } from 'starknet';
import { Token } from 'src/lib/agent/limit';


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

/**
 * Formats amount to the correct decimal places for the token
 * @payload amount The amount as a string (e.g., "0.0001")
 * @payload decimals Number of decimal places
 * @returns Formatted amount as a string
 */
export const formatTokenAmount = (amount: string, decimals: number): string => {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0');
  return whole + paddedFraction;
};

/**
 * Checks if transfer amount is within limits
 * @param {BigNumberish} amount - Transfer amount
 * @param {string} symbol - Token symbol
 * @param {Token[]} limit - Array of token limits
 */
export const handleLimitTokenTransfer = (
  amount: BigNumberish,
  symbol: string,
  limit: Token[]
) => {
  const index = limit.findIndex(
    (token) => token.symbol.toUpperCase() === symbol.toUpperCase()
  );
  if (index === -1) {
    console.log(`Not limit find for token : ${symbol}`);
    return;
  }

  const decimals =
    DECIMALS[limit[index].symbol as keyof typeof DECIMALS] || DECIMALS.DEFAULT;
  const formattedAmount = formatTokenAmount(limit[index].amount, decimals);
  const amountUint256 = uint256.bnToUint256(formattedAmount);
  if (BigInt(amount) > BigInt(amountUint256.low)) {
    throw new Error(
      `Error your limit token exceed the transaction amount.\n Transaction amount : ${amount} \n Transacion limit amount ${limit[index].amount}`
    );
  }
  console.log('Limit Token : ', amountUint256.low, amount);
};
