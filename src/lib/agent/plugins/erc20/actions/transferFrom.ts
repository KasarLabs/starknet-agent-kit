import { Account, Contract, validateAndParseAddress } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC20_ABI } from '../abis/erc20Abi';
import { validateAndFormatParams } from '../utils/token';
import { z } from 'zod';
import { transferFromSchema, transferFromSignatureSchema } from '../schemas/schema';


/**
 * Transfers tokens from one address to another using an allowance.
 * @param {StarknetAgentInterface} agent - The Starknet agent interface
 * @param {TransferFromParams} params - Transfer parameters
 * @returns {Promise<string>} JSON string with transaction result
 * @throws {Error} If transfer fails
 */
export const transfer_from = async (
  agent: StarknetAgentInterface,
  params: z.infer<typeof transferFromSchema>
): Promise<string> => {
  try {
    const validatedParams = validateAndFormatParams(
      params.assetSymbol,
      params.fromAddress,
      params.amount
    );
  
    const fromAddress = validatedParams.formattedAddress;
    const toAddress = validateAndParseAddress(params.toAddress);
    const credentials = agent.getAccountCredentials();
    const provider = agent.getProvider();

    const account = new Account(
      provider,
      credentials.accountPublicKey,
      credentials.accountPrivateKey
    );
    
    const contract = new Contract(ERC20_ABI, validatedParams.tokenAddress, provider);
    contract.connect(account);

    const { transaction_hash } = await contract.transferFrom(
      fromAddress,
      toAddress,
      validatedParams.formattedAmountUint256
    );

    await provider.waitForTransaction(transaction_hash);

    return JSON.stringify({
      status: 'success',
      transactionHash: transaction_hash,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Generates transfer signature for batch transfers
 * @param {Object} input - Transfer input
 * @param {TransferFromParams} params - Array of transfer parameters
 * @returns {Promise<string>} JSON string with transaction result
 */
export const transfer_from_signature = async (params: z.infer<typeof transferFromSignatureSchema>): Promise<any> => {
  try {
    const validatedParams = validateAndFormatParams(
      params.assetSymbol,
      params.fromAddress,
      params.amount
    );

    const fromAddress = validatedParams.formattedAddress;
    const toAddress = validateAndParseAddress(params.toAddress);

    const result = {
      status: 'success',
      transactions: {
        contractAddress: validatedParams.tokenAddress,
        entrypoint: 'transfer_from',
        calldata: [
          fromAddress,
          toAddress,
          validatedParams.formattedAmountUint256.low,
          validatedParams.formattedAmountUint256.high
        ],
      },
    };
    return JSON.stringify({ transaction_type: 'INVOKE', results: [result] });
  } catch (error) {
    return {
      status: 'error',
      error: {
        code: 'TRANSFERFROM_CALL_DATA_ERROR',
        message: error.message || 'Failed to generate transferFrom call data',
      },
    };
  }
};
