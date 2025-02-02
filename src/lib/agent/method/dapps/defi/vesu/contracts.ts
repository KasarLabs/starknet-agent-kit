import { Contract, RpcProvider } from 'starknet';
import { Address } from './utils/interface';
import { vTokenAbi } from 'src/core/abis/dapps/vesu/vTokenAbi';
import { singletonAbi } from 'src/core/abis/dapps/vesu/singletonAbi';
import { extensionAbi } from 'src/core/abis/dapps/vesu/extensionAbi';
import { erc20Abi } from 'src/core/abis/dapps/vesu/erc20Abi';

export const getErc20Contract = (address: Address) => {
  const provider = new RpcProvider({ nodeUrl: process.env.RPC_URL });
  return new Contract(erc20Abi, address, provider).typedv2(erc20Abi);
};
export const getVTokenContract = (address: Address) => {
  const provider = new RpcProvider({ nodeUrl: process.env.RPC_URL });
  return new Contract(vTokenAbi, address, provider).typedv2(vTokenAbi);
};

export const getSingletonContract = (address: Address) => {
  const provider = new RpcProvider({ nodeUrl: process.env.RPC_URL });
  return new Contract(singletonAbi, address, provider).typedv2(singletonAbi);
};
export const getExtensionContract = (address: Address) => {
  const provider = new RpcProvider({ nodeUrl: process.env.RPC_URL });
  return new Contract(extensionAbi, address, provider).typedv2(extensionAbi);
};
