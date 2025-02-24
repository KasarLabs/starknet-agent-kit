import { Contract } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ERC721_ABI } from '../abis/erc721Abi';
import { validateAddress, validateAndFormatTokenId } from '../utils/nft';
import { bigint, z } from 'zod';
import { ownerOfSchema } from '../schemas/schema';

function bigintToHex(addressAsBigInt: bigint): string {
  let hexString = addressAsBigInt.toString(16);
  
  hexString = hexString.padStart(64, '0'); 
  hexString = '0x' + hexString;

  return hexString;
}

export const getOwner = async (
  agent: StarknetAgentInterface,
  params: z.infer<typeof ownerOfSchema>
): Promise<string> => {
  try {
    if (!params?.tokenId || !params?.contractAddress) {
      throw new Error('Both token ID and contract address are required');
    }

    const contractAddress = validateAddress(params.contractAddress);
    const tokenId = validateAndFormatTokenId(params.tokenId);

    const provider = agent.getProvider();
    const contract = new Contract(ERC721_ABI, contractAddress, provider);

    const ownerResponse = await contract.ownerOf(tokenId);
    console.log(BigInt(ownerResponse).toString());
    return JSON.stringify({
      status: 'success',
      owner: bigintToHex(BigInt(ownerResponse)),
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
