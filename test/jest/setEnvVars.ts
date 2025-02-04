import { setupTestEnvironment } from '../utils/helpers';
import { RpcProvider } from 'starknet';
import { StarknetAgentInterface } from '../../src/lib/agent/tools/tools';
import { AccountManager } from 'src/lib/agent/method/core/account/utils/AccountManager';
import { TransactionMonitor } from 'src/lib/agent/method/core/transaction/utils/TransactionMonitor';
import { ContractInteractor } from 'src/lib/agent/method/core/contract/utils/ContractInteractor';

setupTestEnvironment();

export const createMockStarknetAgent = (): StarknetAgentInterface => {
  const provider = new RpcProvider({ nodeUrl: 'http://localhost:5050' });
  
  return {
    getAccountCredentials: () => ({
      accountPublicKey: '0x034ba56f92265f0868c57d3fe72ecab144fc96f97954bbbc4252cef8e8a979ba',
      accountPrivateKey: '0x00000000000000000000000000000000b137668388dbe9acdfa3bc734cc2c469'
    }),
    getModelCredentials: () => ({
      aiModel: '',
      aiProviderApiKey: ''
    }),
    getSignature: () => ({
      signature: ''
    }),
    getProvider: () => provider,
    accountManager: new AccountManager(provider),
    transactionMonitor: new TransactionMonitor(provider),
    contractInteractor: new ContractInteractor(provider),
  };
};

export const createMockInvalidStarknetAgent = (): StarknetAgentInterface => {
  const provider = new RpcProvider({ nodeUrl: 'http://localhost:5050' });
  
  return {
    getAccountCredentials: () => ({
      accountPublicKey: '0x034ba56f92265f0868c57d3fe72ecab144fc96f97954bbbc4252cef8e8a979ba',
      accountPrivateKey: 'dsfahdskfgdsjkah'
    }),
    getModelCredentials: () => ({
      aiModel: '',
      aiProviderApiKey: ''
    }),
    getSignature: () => ({
      signature: ''
    }),
    getProvider: () => provider,
    accountManager: new AccountManager(provider),
    transactionMonitor: new TransactionMonitor(provider),
    contractInteractor: new ContractInteractor(provider),
  };
};
