import { Account, Contract, uint256 } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC20_ABI } from '../abis/erc20Abi';
import { validateTokenAddress } from '../utils/token';

// Constants for wallet detection
const ARGENT_PROXY_CLASS_HASH = "0x025ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918";

export interface ApproveParams {
  spenderAddress: string;
  amount: string;
  assetSymbol: string;
}

const toTokenUnits = (amount: string, decimals: number = 18): bigint => {
  amount = amount.replace(/,/g, '');
  const parts = amount.split('.');
  const whole = parts[0];
  const decimal = parts[1] || '';
  
  let value = BigInt(whole) * BigInt(10 ** decimals);
  
  if (decimal) {
    const decimalLength = decimal.length;
    if (decimalLength > decimals) {
      throw new Error(`Too many decimal places (max ${decimals})`);
    }
    const decimalValue = BigInt(decimal.padEnd(decimals, '0'));
    value += decimalValue;
  }
  
  return value;
};

export const approve = async (
  agent: StarknetAgentInterface,
  params: ApproveParams
): Promise<string> => {
  try {
    if (!params?.assetSymbol) {
      throw new Error('Asset symbol is required');
    }
    
    const tokenAddress = validateTokenAddress(params.assetSymbol);
    const provider = agent.getProvider();
    const accountCredentials = agent.getAccountCredentials();
    
    // Check account type
    const classAtResult = await provider.getClassAt(accountCredentials.accountPublicKey);
    const class_hash = 'class_hash' in classAtResult ? classAtResult.class_hash : undefined;
    console.log('Account class hash:', class_hash);
    
    // Create account with appropriate version
    const account = new Account(
      provider,
      accountCredentials.accountPublicKey,
      accountCredentials.accountPrivateKey,
      '1' 
    );
    
    const contract = new Contract(ERC20_ABI, tokenAddress, provider);
    contract.connect(account);
    
    const amountInTokenUnits = toTokenUnits(params.amount);
    console.log('Approving', params.amount, 'tokens for', params.spenderAddress);
    
    // Execute approve with proper options for Argent
    const { transaction_hash } = await contract.approve(
      params.spenderAddress,
      uint256.bnToUint256(amountInTokenUnits),
      {
        maxFee:'0x6794975f8518'
      }
    );
    
    await provider.waitForTransaction(transaction_hash);
    
    return JSON.stringify({
      status: 'success',
      transactionHash: transaction_hash,
    });
    
  } catch (error) {
    console.log('Error in approve:', error);
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};