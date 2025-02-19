import { Account, Contract, uint256 } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC20_ABI } from '../abis/erc20Abi';
import { 
  validateTokenAddress,
  formatTokenAmount,
  handleLimitTokenTransfer
 } from '../utils/token';
import { DECIMALS } from '../types/types';
import { tokenAddresses } from '../constant/erc20';
import { z } from 'zod';
import { approveSchema, approveSignatureSchema } from '../schemas/schema';

export const approve = async (
  agent: StarknetAgentInterface,
  params: z.infer<typeof approveSchema>
): Promise<string> => {
  try {
    if (!params?.symbol) {
      throw new Error('Asset symbol is required');
    }
    
    const tokenAddress = validateTokenAddress(params.symbol);
    const provider = agent.getProvider();
    const accountCredentials = agent.getAccountCredentials();
    
    const account = new Account(
      provider,
      accountCredentials.accountPublicKey,
      accountCredentials.accountPrivateKey, 
    );
    
    const contract = new Contract(ERC20_ABI, tokenAddress, provider);
    contract.connect(account);
    
    const decimals = DECIMALS[params.symbol as keyof typeof DECIMALS] || DECIMALS.DEFAULT;
    const formattedAmount = formatTokenAmount(params.amount, decimals);
    const amountUint256 = uint256.bnToUint256(formattedAmount);
    
    console.log('Approving', params.amount, 'tokens for', params.spender_address);
    
    const { transaction_hash } = await contract.approve(
      params.spender_address,
      amountUint256,
    );
    
    await provider.waitForTransaction(transaction_hash);

    return JSON.stringify({
      status: 'success',
      amount: params.amount,
      symbol: params.symbol,
      spender_address: params.spender_address,
      transactionHash: transaction_hash,
    });
    
  } catch (error) {
    console.log('Error in approve:', error);
    
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
      step: 'transfer execution',
    });
  }
};


/**
 * Generates approve signature for batch approvals
 * @param {Object} input - Approve input
 * @param {ApprovePayloadSchema[]} input.params - Array of approve parameters
 * @returns {Promise<string>} JSON string with transaction result
 */
export const approve_signature = async (input: {
  params: z.infer<typeof approveSignatureSchema>;
}): Promise<any> => {
  try {
    const params = input.params;

    if (!Array.isArray(params)) {
      throw new Error('params is not an Array');
    }

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

        const decimals = DECIMALS[payload.symbol as keyof typeof DECIMALS] || DECIMALS.DEFAULT;
        const formattedAmount = formatTokenAmount(payload.amount, decimals);
        const amountUint256 = uint256.bnToUint256(formattedAmount);

        return {
          status: 'success',
          transactions: {
            contractAddress: tokenAddress,
            entrypoint: 'approve',
            calldata: [
              payload.spender_address,
              amountUint256.low,
              amountUint256.high,
            ],
          },
        };
      })
    );

    console.log('Results:', results);
    return JSON.stringify({ transaction_type: 'INVOKE', results });
  } catch (error) {
    console.error('Approve call data failure:', error);
    return {
      status: 'error',
      error: {
        code: 'APPROVE_CALL_DATA_ERROR',
        message: error.message || 'Failed to generate approve call data',
      },
    };
  }
};
