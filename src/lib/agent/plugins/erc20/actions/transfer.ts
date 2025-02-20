import { Account, BigNumberish, uint256 } from 'starknet';
import { tokenAddresses } from '../constant/erc20';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { AddAgentLimit } from 'src/lib/agent/limit';
import { 
  validateTokenAddress,
  formatTokenAmount,
  validateAndFormatParams
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
 * @param {StarknetAgentInterface} agent - The Starknet agent interface
 * @param {TransferParams} params - Transfer parameters
 * @returns {Promise<string>} JSON string with transaction result
 * @throws {Error} If transfer fails
 */
export const transfer = async (
  agent: StarknetAgentInterface,
  params: z.infer<typeof transferSchema>
): Promise<string> => {
  try {
    const validatedParams = validateAndFormatParams(
      params.assetSymbol,
      params.recipientAddress,
      params.amount
    );

    const recipientAddress = validatedParams.formattedAddress;
    const credentials = agent.getAccountCredentials();
    const provider = agent.getProvider();

    const account = new Account(
      provider,
      credentials.accountPublicKey,
      credentials.accountPrivateKey
    );
    
    const result = await account.execute({
      contractAddress: validatedParams.tokenAddress,
      entrypoint: 'transfer',
      calldata: [
        recipientAddress,
        validatedParams.formattedAmountUint256.low,
        validatedParams.formattedAmountUint256.high,
      ],
    });

    await provider.waitForTransaction(result.transaction_hash);

    const transferResult: TransferResult = {
      status: 'success',
      amount: params.amount,
      symbol: validatedParams.formattedSymbol,
      recipients_address: params.recipientAddress,
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
 * @param {TransferParams} input.params - Array of transfer parameters
 * @returns {Promise<string>} JSON string with transaction result
 */
export const transfer_signature = async (params: z.infer<typeof transferSignatureSchema>): Promise<any> => {
  try {
    const validatedParams = validateAndFormatParams(
      params.assetSymbol,
      params.recipientAddress,
      params.amount
    );

    const recipientAddress = validatedParams.formattedAddress;

    const result = {
      status: 'success',
      transactions: {
        contractAddress: validatedParams.tokenAddress,
        entrypoint: 'transfer',
        calldata: [
          recipientAddress,
          validatedParams.formattedAmountUint256.low,
          validatedParams.formattedAmountUint256.high,
        ],
      },
    };

    return JSON.stringify({ transaction_type: 'INVOKE', results: [result] });
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
