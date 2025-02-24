import { setupTestEnvironment } from '../utils/helpers';
import { RpcProvider } from 'starknet';
import { StarknetAgentInterface } from '../../src/lib/agent/tools/tools';
import { TransactionMonitor } from 'src/lib/agent/plugins/core/transaction/utils/TransactionMonitor';
import { ContractInteractor } from 'src/lib/agent/plugins/core/contract/utils/ContractInteractor';
import { Limit } from 'src/lib/agent/limit';
// import { TwitterInterface } from 'src/lib/agent/plugins/Twitter/interface/twitter-interface';
import { TelegramInterface } from 'src/lib/agent/plugins/telegram/interfaces';

setupTestEnvironment();

export const createMockStarknetAgent = (): StarknetAgentInterface => {
  const provider = new RpcProvider({ nodeUrl: 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/twNPk5lDPh5t6m0WV6eoXdAD2VfIN0-b' });
  const twitter_interface= {};
  const telegram_interface: TelegramInterface = {};
  const json_config = undefined;
  const twitter_auth_mode = undefined;
  const token_limit: Limit = {};

  return {
    getAccountCredentials: () => ({
      accountPublicKey:
        '0x06889CE7127025749Ab8c2F63c4ba26f972b16530B9aCee3255e59055c0B8CFd',
      accountPrivateKey:
        '0x0716dddddddddddd1ac4e5843aca24fa2d77abebc915',
    }),
    getModelCredentials: () => ({
      aiModel: '',
      aiProviderApiKey: '',
    }),
    getSignature: () => ({
      signature: '',
    }),
    getProvider: () => provider,
    transactionMonitor: new TransactionMonitor(provider),
    contractInteractor: new ContractInteractor(provider),
    getLimit: () => token_limit,
    getTwitterAuthMode: () => twitter_auth_mode,
    getAgentConfig: () => json_config,
    getTwitterManager: () => twitter_interface,
    getTelegramManager: () => telegram_interface,
  };
};

export const createMockInvalidStarknetAgent = (): StarknetAgentInterface => {
  const provider = new RpcProvider({ nodeUrl: 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/twNPk5lDPh5t6m0WV6eoXdAD2VfIN0-b' });
  const twitter_interface= {};
  const telegram_interface: TelegramInterface = {};
  const json_config = undefined;
  const twitter_auth_mode = undefined;
  const token_limit: Limit = {};

  return {
    getAccountCredentials: () => ({
      accountPublicKey: 'dlksjflkdsjf',
      accountPrivateKey: 'dsfahdskfgdsjkah',
    }),
    getModelCredentials: () => ({
      aiModel: '',
      aiProviderApiKey: '',
    }),
    getSignature: () => ({
      signature: '',
    }),
    getProvider: () => provider,
    transactionMonitor: new TransactionMonitor(provider),
    contractInteractor: new ContractInteractor(provider),
    getLimit: () => token_limit,
    getTwitterAuthMode: () => twitter_auth_mode,
    getAgentConfig: () => json_config,
    getTwitterManager: () => twitter_interface,
    getTelegramManager: () => telegram_interface,
  };
};
