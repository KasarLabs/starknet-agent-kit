import { Account, Contract } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC721_ABI } from '../abis/erc721Abi';
import { validateAddress, validateAndFormatTokenId } from '../utils/nft';
import { z } from 'zod';
import { transferFromSchema } from '../schemas/schema';
import { TransactionResult } from '../types/types';

export const transferFrom = async (
  agent: StarknetAgentInterface,
  params: z.infer<typeof transferFromSchema>
): Promise<string> => {
  try {
    if (!params?.fromAddress || !params?.toAddress || !params?.tokenId || !params?.contractAddress) {
      throw new Error('From address, to address, token ID and contract address are required');
    }

    const fromAddress = validateAddress(params.fromAddress);
    const toAddress = validateAddress(params.toAddress);
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

    const { transaction_hash } = await contract.transferFrom(
      fromAddress,
      toAddress,
      tokenId
    );

    await provider.waitForTransaction(transaction_hash);

    const result: TransactionResult = {
      status: 'success',
      tokenId: params.tokenId,
      from: fromAddress,
      to: toAddress,
      transactionHash: transaction_hash,
    };

    return JSON.stringify(result);
  } catch (error) {
    const result: TransactionResult = {
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
      step: 'transfer execution',
    };
    return JSON.stringify(result);
  }
};

export const transferFromSignature = async (
    params: z.infer<typeof transferFromSchema>
  ): Promise<any> => {
    try {
      if (!params?.fromAddress || !params?.toAddress || !params?.tokenId || !params?.contractAddress) {
        throw new Error('From address, to address, token ID and contract address are required');
      }
  
      const fromAddress = validateAddress(params.fromAddress);
      const toAddress = validateAddress(params.toAddress);
      const tokenId = validateAndFormatTokenId(params.tokenId);
      const contractAddress = validateAddress(params.contractAddress);
  
      const result = {
        status: 'success',
        transactions: {
          contractAddress: contractAddress,
          entrypoint: 'transferFrom',
          calldata: [
            fromAddress,
            toAddress,
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
          code: 'TRANSFER_FROM_CALL_DATA_ERROR',
          message: error.message || 'Failed to generate transferFrom call data',
        },
      };
    }
  };