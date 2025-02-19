import { Account, Contract, uint256 } from 'starknet';
import { tokenAddresses } from '../constant/erc20';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC20_ABI } from '../abis/erc20Abi';
import { validateTokenAddress, formatTokenAmount } from '../utils/token';
import { DECIMALS } from '../types/types';
import { z } from 'zod';
import { transferFromSchema, transferFromSignatureSchema } from '../schemas/schema';


/**
 * Transfers tokens from one address to another using an allowance.
 * @async
 * @function transferFrom
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
    if (!params?.symbol) {
      throw new Error('Asset symbol is required');
    }
    const symbol = params.symbol.toUpperCase();
    const tokenAddress = validateTokenAddress(symbol);
    const credentials = agent.getAccountCredentials();
    const provider = agent.getProvider();

    const account = new Account(
      provider,
      credentials.accountPublicKey,
      credentials.accountPrivateKey
    );

    const decimals = DECIMALS[symbol as keyof typeof DECIMALS] || DECIMALS.DEFAULT;
    const formattedAmount = formatTokenAmount(params.amount, decimals);
    const amountUint256 = uint256.bnToUint256(formattedAmount);

    
    const contract = new Contract(ERC20_ABI, tokenAddress, provider);
    contract.connect(account);

    const balanceResponse = await contract.balanceOf(params.fromAddress);
    console.log('Source account balance:', balanceResponse);

    const allowanceResponse = await contract.allowance(params.fromAddress, credentials.accountPublicKey);
    console.log('Current allowance:', allowanceResponse);

    console.log('Transferring', params.amount, 'tokens from', params.fromAddress, 'to', params.toAddress);
    const { transaction_hash } = await contract.transferFrom(
      params.fromAddress,
      params.toAddress,
      amountUint256
    );

    await provider.waitForTransaction(transaction_hash);

    return JSON.stringify({
      status: 'success',
      transactionHash: transaction_hash,
    });
  } catch (error) {
    console.log('Error in transferFrom:', error);
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Generates transfer signature for batch transfers
 * @param {Object} input - Transfer input
 * @param {TransferFromParams[]} input.params - Array of transfer parameters
 * @returns {Promise<string>} JSON string with transaction result
 */
export const transfer_from_signature = async (input: {
  params: z.infer<typeof transferFromSignatureSchema>;
}): Promise<any> => {
  try {
    const params = input.params;

    if (!Array.isArray(params)) {
      throw new Error('params is not an Array');
    }

    const results = await Promise.all(
      params.map(async (payload) => {
        const symbol = payload.symbol.toUpperCase();
        const tokenAddress = tokenAddresses[symbol];
        if (!tokenAddress) {
          return {
            status: 'error',
            error: {
              code: 'TOKEN_NOT_SUPPORTED',
              message: `Token ${symbol} not supported`,
            },
          };
        }
        
        const decimals = DECIMALS[symbol as keyof typeof DECIMALS] || DECIMALS.DEFAULT;
        const formattedAmount = formatTokenAmount(payload.amount, decimals);
        const amountUint256 = uint256.bnToUint256(formattedAmount);

        return {
          status: 'success',
          transactions: {
            contractAddress: tokenAddress,
            entrypoint: 'transfer_from',
            calldata: [
              payload.fromAddress,
              payload.toAddress,
              amountUint256.low,
              amountUint256.high
            ],
          },
        };
      })
    );
    console.log('Results :', results);
    return JSON.stringify({ transaction_type: 'INVOKE', results });
  } catch (error) {
    console.error('Transfer_from call data failure:', error);
    return {
      status: 'error',
      error: {
        code: 'TRANSFERFROM_CALL_DATA_ERROR',
        message: error.message || 'Failed to generate transferFrom call data',
      },
    };
  }
};
