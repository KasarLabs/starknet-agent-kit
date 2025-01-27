import { Account, uint256 } from 'starknet';
import { tokenAddresses } from 'src/core/constants/tokens/erc20';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { error } from 'console';

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
 * @param agent The agent performing the transfer
 * @param params transfer parameters including recipient, amount, and token symbol
 * @returns Result of the transfer operation
 */
export const transfer = async (
  agent: StarknetAgentInterface,
  params: transferParams
): Promise<string> => {
  try {
    const credentials = agent.getAccountCredentials();
    const provider = agent.getProvider();

    const account = new Account(
      provider,
      credentials.accountPublicKey,
      credentials.accountPrivateKey
    );

    const tokenAddress = tokenAddresses[params.symbol];
    if (!tokenAddress) {
      throw new Error(`Token ${params.symbol} not supported`);
    }

    const decimals =
      DECIMALS[params.symbol as keyof typeof DECIMALS] || DECIMALS.DEFAULT;
    const formattedAmount = formatTokenAmount(params.amount, decimals);
    const amountUint256 = uint256.bnToUint256(formattedAmount);

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

    const result = JSON.stringify(transferResult);
    return result;
  }
};

export type TransferPlayloadSchema = {
  params: {
    symbol: string;
    recipient_address: string;
    amount: string;
  }[];
};

export const transfer_call_data = async (
  input: TransferPlayloadSchema
): Promise<any> => {
  try {
    const results = await Promise.all(
      input.params.map(async (param) => {
        const tokenAddress = tokenAddresses[param.symbol];
        if (!tokenAddress) {
          return {
            status: 'error',
            error: {
              code: 'TOKEN_NOT_SUPPORTED',
              message: `Token ${param.symbol} not supported`,
            },
          };
        }

        const decimals =
          DECIMALS[param.symbol as keyof typeof DECIMALS] || DECIMALS.DEFAULT;
        const formattedAmount = formatTokenAmount(param.amount, decimals);
        const amountUint256 = uint256.bnToUint256(formattedAmount);
        return {
          status: 'success',
          transactions: {
            contractAddress: tokenAddress,
            entrypoint: 'transfer',
            calldata: [
              param.recipient_address,
              amountUint256.low,
              amountUint256.high,
            ],
          },
        };
      })
    );
    return JSON.stringify(results);
  } catch (error) {
    console.error('Transfer call data failure:', error);
    return {
      status: 'error',
      error: {
        code: 'TRANSFER_CALL_DATA_ERROR',
        message: error.message || 'Failed to generate transfer call data',
      },
    };
  }
};
