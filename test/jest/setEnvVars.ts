import { setupTestEnvironment } from '../utils/helpers';
import { RpcProvider } from 'starknet';
import { StarknetAgentInterface } from '../../src/lib/agent/tools/tools';
import { AccountManager } from 'src/lib/agent/plugins/core/account/utils/AccountManager';
import { TransactionMonitor } from 'src/lib/agent/plugins/core/transaction/utils/TransactionMonitor';
import { ContractInteractor } from 'src/lib/agent/plugins/core/contract/utils/ContractInteractor';
import { Limit } from 'src/lib/agent/limit';
// import  } from 'src/lib/agent/plugins/Twitter/interface/twitter-interface';
import { TelegramInterface } from 'src/lib/agent/plugins/telegram/interfaces';

setupTestEnvironment();

export const createMockStarknetAgent = (): StarknetAgentInterface => {
  const provider = new RpcProvider({ nodeUrl: 'http://127.0.0.1:5050' });
  const twitter_interface = {};
  const telegram_interface : TelegramInterface = {};
  const json_config = undefined;
  const twitter_auth_mode = undefined;
  const token_limit: Limit = {};

  return {
    getAccountCredentials: () => ({
      accountPublicKey:
        '0x064b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691',
      accountPrivateKey:
        '0x0000000000000000000000000000000071d7bb07b9a64f6f78ac4c816aff4da9',
    }),
    getModelCredentials: () => ({
      aiModel: '',
      aiProviderApiKey: '',
    }),
    getSignature: () => ({
      signature: '',
    }),
    getProvider: () => provider,
    accountManager: new AccountManager(provider),
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
  const twitter_interface = {};
  const telegram_interface : TelegramInterface = {};
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
    accountManager: new AccountManager(provider),
    transactionMonitor: new TransactionMonitor(provider),
    contractInteractor: new ContractInteractor(provider),
    getLimit: () => token_limit,
    getTwitterAuthMode: () => twitter_auth_mode,
    getAgentConfig: () => json_config,
    getTwitterManager: () => twitter_interface,
    getTelegramManager: () => telegram_interface,
  };
};
