import { Contract } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC721_ABI } from '../abis/erc721Abi';
import { validateAddress, validateAndFormatTokenId } from '../utils/nft';
import { z } from 'zod';
import { getApprovedSchema } from '../schemas/schema';

export const getApproved = async (
  agent: StarknetAgentInterface,
  params: z.infer<typeof getApprovedSchema>
): Promise<string> => {
  try {
    if (!params?.tokenId || !params?.contractAddress) {
      throw new Error('Both token ID and contract address are required');
    }

    const contractAddress = validateAddress(params.contractAddress);
    const tokenId = validateAndFormatTokenId(params.tokenId);

    const provider = agent.getProvider();
    const contract = new Contract(ERC721_ABI, contractAddress, provider);

    const approvedResponse = await contract.getApproved(tokenId);

    return JSON.stringify({
      status: 'success',
      approved: approvedResponse.toString(),
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};