import { Provider } from 'starknet';

export const PluginsNeedEnvValue = [
  'twitter',
  'telegram',
  'discord',
  'coingecko',
];

export const checkFormatStarknetAddress = (address: string): boolean => {
  // Check format of starknet address and return true if it is correct
  if (!address) {
    return false;
  }

  if (address.startsWith('0x')) {
    address = address.slice(2);
  }

  if (address.length !== 64) {
    return false;
  }
  return true;
};

export const checkStarknetRpcUrl = async (rpc: string): Promise<boolean> => {
  const provider = new Provider({ nodeUrl: rpc });
  if (!provider) {
    return false;
  }
  console.log(rpc);
  const isProvider = await provider
    .getBlockLatestAccepted()
    .then((block) => {
      if (!block) {
        return false;
      }
      return true;
    })
    .catch((error) => {
      return false;
    });
  return isProvider;
};
