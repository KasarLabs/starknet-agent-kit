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

/**
 * Approves token spending
 * @param {StarknetAgentInterface} agent - The Starknet agent interface
 * @param {ApproveParams} params - Approval parameters
 * @returns {Promise<string>} JSON string with transaction result
 * @throws {Error} If approval fails
 */
export const approve = async (
  agent: StarknetAgentInterface,
  params: z.infer<typeof approveSchema>
): Promise<string> => {
  try {
    if (!params?.assetSymbol) {
      throw new Error('Asset symbol is required');
    }
    
    const symbol = params.assetSymbol.toUpperCase();
    const tokenAddress = validateTokenAddress(symbol);
    const provider = agent.getProvider();
    const accountCredentials = agent.getAccountCredentials();
    
    const account = new Account(
      provider,
      accountCredentials.accountPublicKey,
      accountCredentials.accountPrivateKey, 
    );
    
    const contract = new Contract(ERC20_ABI, tokenAddress, provider);
    contract.connect(account);
    
    const decimals = DECIMALS[symbol as keyof typeof DECIMALS] || DECIMALS.DEFAULT;
    const formattedAmount = formatTokenAmount(params.amount, decimals);
    const amountUint256 = uint256.bnToUint256(formattedAmount);
    
    console.log('Approving', params.amount, 'tokens for', params.spenderAddress);
    
    const { transaction_hash } = await contract.approve(
      params.spenderAddress,
      amountUint256,
    );
    
    await provider.waitForTransaction(transaction_hash);

    return JSON.stringify({
      status: 'success',
      amount: params.amount,
      symbol: params.assetSymbol,
      spender_address: params.spenderAddress,
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
 * @param {ApproveParams[]} input.params - Array of approve parameters
 * @returns {Promise<string>} JSON string with transaction result
 */
export const approve_signature = async (params: z.infer<typeof approveSignatureSchema>): Promise<any> => {
  try {
    const symbol = params.assetSymbol.toUpperCase();
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
    const formattedAmount = formatTokenAmount(params.amount, decimals);
    const amountUint256 = uint256.bnToUint256(formattedAmount);

    const result = {
      status: 'success',
      transactions: {
        contractAddress: tokenAddress,
        entrypoint: 'approve',
        calldata: [
          params.spenderAddress,
          amountUint256.low,
          amountUint256.high,
        ],
      },
    };

    console.log('Result:', result);
    return JSON.stringify({ transaction_type: 'INVOKE', result });
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