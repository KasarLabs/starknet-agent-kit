import { Contract, RpcProvider } from 'starknet';
import { Address } from '../interfaces';
import { vTokenAbi } from 'plugins/vesu/abis/vTokenAbi';
import { singletonAbi } from 'plugins/vesu/abis/singletonAbi';
import { extensionAbi } from 'plugins/vesu/abis/extensionAbi';
import { erc20Abi } from 'plugins/vesu/abis/erc20Abi';

export const getErc20Contract = (address: Address) => {
  const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
  return new Contract(erc20Abi, address, provider).typedv2(erc20Abi);
};
export const getVTokenContract = (address: Address) => {
  const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
  return new Contract(vTokenAbi, address, provider).typedv2(vTokenAbi);
};

export const getSingletonContract = (address: Address) => {
  const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
  return new Contract(singletonAbi, address, provider).typedv2(singletonAbi);
};
export const getExtensionContract = (address: Address) => {
  const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
  return new Contract(extensionAbi, address, provider).typedv2(extensionAbi);
};
