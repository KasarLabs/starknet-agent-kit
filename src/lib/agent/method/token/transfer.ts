import { Account, RpcProvider, uint256 } from 'starknet';
import { RPC_URL, tokenAddresses } from 'src/lib/constant';

// Types
export interface transferParams {
  recipient_address: string;
  amount: string;
  symbol: string;
}

interface TransferResult {
  status: 'success' | 'failure';
  amount?: string;
  symbol?: string;
  recipients_address?: string;
  transaction_hash?: string;
  error?: string;
  step?: string;
}

// Constants
const DECIMALS = {
  USDC: 6,
  USDT: 6,
  DEFAULT: 18,
};

/**
 * Formats amount to the correct decimal places for the token
 * @param amount The amount as a string (e.g., "0.0001")
 * @param decimals Number of decimal places
 * @returns Formatted amount as a string
 */
const formatTokenAmount = (amount: string, decimals: number): string => {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0');
  return whole + paddedFraction;
};

/**
 * Transfers ERC20 tokens on Starknet
 * @param params transfer parameters including recipient, amount, and token symbol
 * @returns Result of the transfer operation
 */
export const transfer = async (params: transferParams): Promise<string> => {
  try {
    // Environment validation
    const privateKey = process.env.PRIVATE_KEY;
    const accountAddress = process.env.PUBLIC_ADDRESS;

    if (!privateKey || !accountAddress) {
      throw new Error('PRIVATE_KEY or PUBLIC_ADDRESS not set in .env file');
    }

    // Provider and account setup
    const provider = new RpcProvider({ nodeUrl: RPC_URL });
    const account = new Account(provider, accountAddress, privateKey);

    // Token validation and setup
    const tokenAddress = tokenAddresses[params.symbol];
    if (!tokenAddress) {
      throw new Error(`Token ${params.symbol} not supported`);
    }

    // Amount formatting
    const decimals =
      DECIMALS[params.symbol as keyof typeof DECIMALS] || DECIMALS.DEFAULT;
    const formattedAmount = formatTokenAmount(params.amount, decimals);
    const amountUint256 = uint256.bnToUint256(formattedAmount);

    // Execute transfer
    const result = await account.execute({
      contractAddress: tokenAddress,
      entrypoint: 'transfer',
      calldata: [
        params.recipient_address,
        amountUint256.low,
        amountUint256.high,
      ],
    });

    console.log(
      'transfer initiated. Transaction hash:',
      result.transaction_hash
    );

    // Wait for transaction confirmation
    await provider.waitForTransaction(result.transaction_hash);

    const transferResult: TransferResult = {
      status: 'success',
      amount: params.amount,
      symbol: params.symbol,
      recipients_address: params.recipient_address,
      transaction_hash: result.transaction_hash,
    };

    return JSON.stringify(transferResult);
  } catch (error) {
    console.error('transfer failed:', error);

    const transferResult: TransferResult = {
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
      step: 'transfer execution',
    };

    return JSON.stringify(transferResult);
  }
};
