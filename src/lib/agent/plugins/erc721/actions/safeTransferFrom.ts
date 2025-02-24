import { Account, Contract, constants } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC721_ABI } from '../abis/erc721Abi';
import { validateAddress, validateAndFormatTokenId, executeV3Transaction } from '../utils/nft';
import { z } from 'zod';
import { safeTransferFromSchema } from '../schemas/schema';
import { TransactionResult } from '../types/types';

export const safeTransferFrom = async (
  agent: StarknetAgentInterface,
  params: z.infer<typeof safeTransferFromSchema>
): Promise<string> => {
  try {
    if (!params?.fromAddress || !params?.toAddress || !params?.tokenId || !params?.contractAddress) {
      throw new Error('From address, to address, token ID and contract address are required');
    }

    const fromAddress = validateAddress(params.fromAddress);
    const toAddress = validateAddress(params.toAddress);
    const tokenId = validateAndFormatTokenId(params.tokenId);
    const contractAddress = validateAddress(params.contractAddress);
    const data = params.data || ['0x0'];

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

    const calldata = contract.populate('safe_transfer_from', [
      fromAddress,
      toAddress,
      tokenId,
      data
    ]);

    const txH = await executeV3Transaction({
      call: calldata,
      account: account,
    });

    const result: TransactionResult = {
      status: 'success',
      tokenId: params.tokenId,
      from: fromAddress,
      to: toAddress,
      transactionHash: txH,
    };

    return JSON.stringify(result);
  } catch (error) {
    const result: TransactionResult = {
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
      step: 'safe transfer execution',
    };
    return JSON.stringify(result);
  }
};

export const safeTransferFromSignature = async (
  params: z.infer<typeof safeTransferFromSchema>
): Promise<any> => {
  try {
    if (!params?.fromAddress || !params?.toAddress || !params?.tokenId || !params?.contractAddress) {
      throw new Error('From address, to address, token ID and contract address are required');
    }

    const fromAddress = validateAddress(params.fromAddress);
    const toAddress = validateAddress(params.toAddress);
    const tokenId = validateAndFormatTokenId(params.tokenId);
    const contractAddress = validateAddress(params.contractAddress);
    const data = params.data || '0x0';

    const result = {
      status: 'success',
      transactions: {
        contractAddress: contractAddress,
        entrypoint: 'safe_transfer_from',
        calldata: [
          fromAddress,
          toAddress,
          tokenId.low,
          tokenId.high,
          data
        ],
      },
    };

    return JSON.stringify({ transaction_type: 'INVOKE', results: [result] });
  } catch (error) {
    return {
      status: 'error',
      error: {
        code: 'SAFE_TRANSFER_FROM_CALL_DATA_ERROR',
        message: error.message || 'Failed to generate safeTransferFrom call data',
      },
    };
  }
};