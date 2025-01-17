import { ContractAddressParams } from 'src/lib/agent/schema';
import { Contract } from 'starknet';
import { rpcProvider } from 'src/lib/agent/starknetAgent';
import { FACTORY_ADDRESS } from 'src/lib/utils/unruggable';
import { factoryAbi } from 'src/lib/utils/unruggable/abi';

type LiquidityType =
  | { type: 'JediERC20'; address: string }
  | { type: 'StarkDeFiERC20'; address: string }
  | { type: 'EkuboNFT'; tokenId: number };

interface LockedLiquidityInfo {
  hasLockedLiquidity: boolean;
  liquidityType?: LiquidityType;
  liquidityContractAddress?: string;
}

export const getLockedLiquidity = async (params: ContractAddressParams) => {
  try {
    const contract = new Contract(factoryAbi, FACTORY_ADDRESS, rpcProvider);

    const result = await contract.locked_liquidity(params.contractAddress);
    const liquidityInfo: LockedLiquidityInfo = {
      hasLockedLiquidity: false,
    };

    if (result.length > 0) {
      const [contractAddress, liquidityData] = result;
      liquidityInfo.hasLockedLiquidity = true;
      liquidityInfo.liquidityContractAddress = contractAddress;

      if ('JediERC20' in liquidityData) {
        liquidityInfo.liquidityType = {
          type: 'JediERC20',
          address: liquidityData.JediERC20,
        };
      } else if ('StarkDeFiERC20' in liquidityData) {
        liquidityInfo.liquidityType = {
          type: 'StarkDeFiERC20',
          address: liquidityData.StarkDeFiERC20,
        };
      } else if ('EkuboNFT' in liquidityData) {
        liquidityInfo.liquidityType = {
          type: 'EkuboNFT',
          tokenId: Number(liquidityData.EkuboNFT),
        };
      }
    }

    return {
      status: 'success',
      data: liquidityInfo,
    };
  } catch (error) {
    console.error('Error getting locked liquidity:', error);
    return {
      status: 'failed',
      error: error.message,
    };
  }
};
