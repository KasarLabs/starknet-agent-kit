import { Uint256 } from 'starknet';

/**
 * Formats token amount with correct decimals
 * @param {string} amount - Amount to format
 * @param {number} decimals - Number of decimals
 * @returns {string} Formatted amount
 */
export const DECIMALS = {
  USDC: 6,
  USDT: 6,
  DEFAULT: 18,
};

/**
 * Result interface for transfer operations
 * @interface TransferResult
 */
export interface TransferResult {
  status: 'success' | 'failure';
  amount?: string;
  symbol?: string;
  recipients_address?: string;
  transaction_hash?: string;
  error?: string;
  step?: string;
}

/**
 * Parameters validation result
 * @interface ParamsValidationResult
 */
export interface ParamsValidationResult {
  formattedSymbol: string;
  formattedAddress: string;
  tokenAddress: string;
  formattedAmountUint256: Uint256;
}
