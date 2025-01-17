import { ContractAddressParams } from 'src/lib/agent/schema';
import { rpcProvider } from 'src/lib/agent/starknetAgent';
import { Contract } from 'starknet';
import { factoryAbi } from '../../../../../../utils/unruggable/abi';
import { FACTORY_ADDRESS } from 'src/lib/utils/unruggable';

export const isMemecoin = async (params: ContractAddressParams) => {
  try {
    const contract = new Contract(factoryAbi, FACTORY_ADDRESS, rpcProvider);
    const result = await contract.is_memecoin(params.contractAddress);

    return JSON.stringify({
      status: 'success',
      isMemecoin: result,
    });
  } catch (error) {
    console.error('Error checking memecoin status:', error);
    return JSON.stringify({
      status: 'failed',
      error: error.message,
    });
  }
};
