import { Account, Contract, constants } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC721_ABI } from '../abis/erc721Abi';
import { validateAddress, executeV3Transaction } from '../utils/nft';
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

    const accountCredentials = agent.getAccountCredentials();
    const provider = agent.getProvider();

    const account = new Account(
      provider,
      accountCredentials.accountPublicKey,
      accountCredentials.accountPrivateKey,
      undefined,
      constants.TRANSACTION_VERSION.V3
    );

    const contract = new Contract(ERC721_ABI, contractAddress, provider);
    contract.connect(account);

    const calldata = contract.populate('set_approval_for_all', [
      operatorAddress,
      params.approved ? true : false
    ]);

    const txH = await executeV3Transaction({
      call: calldata,
      account: account,
    });

    const result: TransactionResult = {
      status: 'success',
      operator: operatorAddress,
      approved: params.approved,
      transactionHash: txH,
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
        entrypoint: 'set_approval_for_all',
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