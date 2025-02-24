import { Account, Contract } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC721_ABI } from '../abis/erc721Abi';
import { validateAddress, validateAndFormatTokenId } from '../utils/nft';
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

    const credentials = agent.getAccountCredentials();
    const provider = agent.getProvider();

    const account = new Account(
      provider,
      credentials.accountPublicKey,
      credentials.accountPrivateKey
    );

    const contract = new Contract(ERC721_ABI, contractAddress, provider);
    contract.connect(account);

    const { transaction_hash } = await contract.approve(
      approvedAddress,
      tokenId
    );

    await provider.waitForTransaction(transaction_hash);

    const result: TransactionResult = {
      status: 'success',
      tokenId: params.tokenId,
      approved: true,
      transactionHash: transaction_hash,
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
