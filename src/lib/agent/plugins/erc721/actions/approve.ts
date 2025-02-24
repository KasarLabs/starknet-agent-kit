import { Account, Contract, constants } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC721_ABI } from '../abis/erc721Abi';
import { validateAddress, validateAndFormatTokenId, executeV3Transaction } from '../utils/nft';
import { z } from 'zod';
import { approveSchema } from '../schemas/schema';
import { TransactionResult } from '../types/types';

export const approve = async (
  agent: StarknetAgentInterface,
  params: z.infer<typeof approveSchema>
): Promise<string> => {
  try {
    if (!params?.approvedAddress || !params?.tokenId || !params?.contractAddress) {
      throw new Error('Approved address, token ID and contract address are required');
    }

    const approvedAddress = validateAddress(params.approvedAddress);
    const tokenId = validateAndFormatTokenId(params.tokenId);
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

    const contract = new Contract(
      ERC721_ABI, 
      contractAddress, 
      provider
    );
    contract.connect(account);

    const calldata = contract.populate('approve', [
      approvedAddress,
      tokenId
    ]);

    const txH = await executeV3Transaction({
      call: calldata,
      account: account,
    });

    const result: TransactionResult = {
      status: 'success',
      tokenId: params.tokenId,
      approved: true,
      transactionHash: txH,
    };

    return JSON.stringify(result);
  } catch (error) {
    const result: TransactionResult = {
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
      step: 'approve execution',
    };
    return JSON.stringify(result);
  }
};

export const approveSignature = async (
  params: z.infer<typeof approveSchema>
): Promise<any> => {
  try {
    if (!params?.approvedAddress || !params?.tokenId || !params?.contractAddress) {
      throw new Error('Approved address, token ID and contract address are required');
    }

    const approvedAddress = validateAddress(params.approvedAddress);
    const tokenId = validateAndFormatTokenId(params.tokenId);
    const contractAddress = validateAddress(params.contractAddress);

    const result = {
      status: 'success',
      transactions: {
        contractAddress: contractAddress,
        entrypoint: 'approve',
        calldata: [
          approvedAddress,
          tokenId.low,
          tokenId.high
        ],
      },
    };

    return JSON.stringify({ transaction_type: 'INVOKE', results: [result] });
  } catch (error) {
    return {
      status: 'error',
      error: {
        code: 'APPROVE_CALL_DATA_ERROR',
        message: error.message || 'Failed to generate approve call data',
      },
    };
  }
};
