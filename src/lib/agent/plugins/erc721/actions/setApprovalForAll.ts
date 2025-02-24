import { Account, Contract } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC721_ABI } from '../abis/erc721Abi';
import { validateAddress } from '../utils/nft';
import { z } from 'zod';
import { setApprovalForAllSchema } from '../schemas/schema';
import { TransactionResult } from '../types/types';

export const setApprovalForAll = async (
  agent: StarknetAgentInterface,
  params: z.infer<typeof setApprovalForAllSchema>
): Promise<string> => {
  try {
    if (!params?.operatorAddress || params?.approved === undefined || !params?.contractAddress) {
      throw new Error('Operator address, approved status and contract address are required');
    }

    const operatorAddress = validateAddress(params.operatorAddress);
    const contractAddress = validateAddress(params.contractAddress);

    const credentials = agent.getAccountCredentials();
    const provider = agent.getProvider();

    const account = new Account(
      provider,
      credentials.accountPublicKey,
      credentials.accountPrivateKey
    );

    const contract = new Contract(ERC721_ABI, contractAddress, provider);
    contract.connect(account);

    const { transaction_hash } = await contract.setApprovalForAll(
      operatorAddress,
      params.approved ? true : false
    );

    await provider.waitForTransaction(transaction_hash);

    const result: TransactionResult = {
      status: 'success',
      operator: operatorAddress,
      approved: params.approved,
      transactionHash: transaction_hash,
    };

    return JSON.stringify(result);
  } catch (error) {
    const result: TransactionResult = {
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
      step: 'setApprovalForAll execution',
    };
    return JSON.stringify(result);
  }
};

export const setApprovalForAllSignature = async (
  params: z.infer<typeof setApprovalForAllSchema>
): Promise<any> => {
  try {
    if (!params?.operatorAddress || params?.approved === undefined || !params?.contractAddress) {
      throw new Error('Operator address, approved status and contract address are required');
    }

    const operatorAddress = validateAddress(params.operatorAddress);
    const contractAddress = validateAddress(params.contractAddress);

    const result = {
      status: 'success',
      transactions: {
        contractAddress: contractAddress,
        entrypoint: 'setApprovalForAll',
        calldata: [
          operatorAddress,
          params.approved ? 1 : 0
        ],
      },
    };

    return JSON.stringify({ transaction_type: 'INVOKE', results: [result] });
  } catch (error) {
    return {
      status: 'error',
      error: {
        code: 'SET_APPROVAL_FOR_ALL_CALL_DATA_ERROR',
        message: error.message || 'Failed to generate setApprovalForAll call data',
      },
    };
  }
};