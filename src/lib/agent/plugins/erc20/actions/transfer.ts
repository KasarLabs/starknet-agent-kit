import { Account, BigNumberish, uint256 } from 'starknet';
import { tokenAddresses } from '../constant/erc20';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { AddAgentLimit } from 'src/lib/agent/limit';
import { 
  validateTokenAddress,
  formatTokenAmount,
  handleLimitTokenTransfer
 } from '../utils/token';
import { DECIMALS } from '../types/types';
import { z } from 'zod';
import { transferSchema, transferSignatureSchema } from '../schemas/schema';


/**
 * Result interface for transfer operations
 * @interface TransferResult
 */
interface TransferResult {
  status: 'success' | 'failure';
  amount?: string;
  symbol?: string;
  recipients_address?: string;
  transaction_hash?: string;
  error?: string;
  step?: string;
}


/**
 * Transfers ERC20 tokens on Starknet
 * @payload agent The agent performing the transfer
 * @payload params transfer payloadeters including recipient, amount, and token symbol
 * @returns Result of the transfer operation
 */
export const transfer = async (
  agent: StarknetAgentInterface,
  params: z.infer<typeof transferSchema>
): Promise<string> => {
  try {
    if (!params?.symbol) {
      throw new Error('Asset symbol is required');
    }
    const tokenAddress = validateTokenAddress(params.symbol);
    const credentials = agent.getAccountCredentials();
    const provider = agent.getProvider();

    const account = new Account(
      provider,
      credentials.accountPublicKey,
      credentials.accountPrivateKey
    );

    const decimals = DECIMALS[params.symbol as keyof typeof DECIMALS] || DECIMALS.DEFAULT;
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
    return JSON.stringify(transferResult);
  }
};


/**
 * Generates transfer signature for batch transfers
 * @param {Object} input - Transfer input
 * @param {TransferPlayloadSchema[]} input.params - Array of transfer parameters
 * @returns {Promise<string>} JSON string with transaction result
 */
export const transfer_signature = async (input: {
  params: z.infer<typeof transferSignatureSchema>;
}): Promise<any> => {
  try {
    const params = input.params;

    if (!Array.isArray(params)) {
      throw new Error('params is not an Array');
    }

    const limit = AddAgentLimit();

    const results = await Promise.all(
      params.map(async (payload) => {
        const tokenAddress = tokenAddresses[payload.symbol];
        if (!tokenAddress) {
          return {
            status: 'error',
            error: {
              code: 'TOKEN_NOT_SUPPORTED',
              message: `Token ${payload.symbol} not supported`,
            },
          };
        }
        const decimals =
          DECIMALS[payload.symbol as keyof typeof DECIMALS] || DECIMALS.DEFAULT;
        const formattedAmount = formatTokenAmount(payload.amount, decimals);
        const amountUint256 = uint256.bnToUint256(formattedAmount);
        if (Array.isArray(limit.transfer_limit)) {
          handleLimitTokenTransfer(
            amountUint256.low,
            payload.symbol,
            limit.transfer_limit
          );
        }

        return {
          status: 'success',
          transactions: {
            contractAddress: tokenAddress,
            entrypoint: 'transfer',
            calldata: [
              payload.recipient_address,
              amountUint256.low,
              amountUint256.high,
            ],
          },
        };
      })
    );
    console.log('Results :', results);
    return JSON.stringify({ transaction_type: 'INVOKE', results });
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
