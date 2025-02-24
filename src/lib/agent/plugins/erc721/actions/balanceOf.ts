import { Contract } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC721_ABI } from '../abis/erc721Abi';
import { validateAddress } from '../utils/nft';
import { z } from 'zod';
import { getBalanceSchema } from '../schemas/schema';

export const getBalance = async (
  agent: StarknetAgentInterface,
  params: z.infer<typeof getBalanceSchema>
): Promise<string> => {
  try {
    if (!params?.accountAddress || !params?.contractAddress) {
      throw new Error('Both account address and contract address are required');
    }

    const accountAddress = validateAddress(params.accountAddress);
    const contractAddress = validateAddress(params.contractAddress);

    const provider = agent.getProvider();
    const contract = new Contract(ERC721_ABI, contractAddress, provider);

    console.log('accountAddress: ', accountAddress);
    const balanceResponse = await contract.balanceOf(accountAddress);

    console.log('balanceResponse: ', balanceResponse);
    return JSON.stringify({
      status: 'success',
      balance: balanceResponse.toString(),
    });
  } catch (error) {
    console.log('error: ', error);
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};