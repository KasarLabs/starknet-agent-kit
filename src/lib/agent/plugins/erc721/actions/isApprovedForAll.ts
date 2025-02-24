import { Contract } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC721_ABI } from '../abis/erc721Abi';
import { validateAddress } from '../utils/nft';
import { z } from 'zod';
import { isApprovedForAllSchema } from '../schemas/schema';

export const isApprovedForAll = async (
  agent: StarknetAgentInterface,
  params: z.infer<typeof isApprovedForAllSchema>
): Promise<string> => {
  try {
    if (!params?.ownerAddress || !params?.operatorAddress || !params?.contractAddress) {
      throw new Error('Owner address, operator address and contract address are required');
    }

    const ownerAddress = validateAddress(params.ownerAddress);
    const operatorAddress = validateAddress(params.operatorAddress);
    const contractAddress = validateAddress(params.contractAddress);

    const provider = agent.getProvider();
    const contract = new Contract(ERC721_ABI, contractAddress, provider);

    const approvedResponse = await contract.isApprovedForAll(
      ownerAddress,
      operatorAddress
    );

    return JSON.stringify({
      status: 'success',
      isApproved: approvedResponse === 1,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};