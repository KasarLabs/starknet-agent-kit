import { RpcProvider } from 'starknet';
import { 
  braavos_initial_classhash, 
  braavos_proxy_classhash,
  braavos_account_classhash } from '../constant/contract';
import { AccountManager } from '../utils/AccountManager';

export const CreateBraavosAccount = async () => {
  try {
    const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
    const accountManager = new AccountManager(
      provider,
      braavos_initial_classhash,
      braavos_proxy_classhash,
      braavos_account_classhash
    );

    const accountDetails = await accountManager.createAccount();

    return JSON.stringify({
      status: 'success',
      wallet: 'Braavos',
      publicKey: accountDetails.publicKey,
      privateKey: accountDetails.privateKey,
      contractAddress: accountDetails.contractAddress,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const CreateBraavosAccountSignature = async () => {
  try {
    const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });

    const accountManager = new AccountManager(
      provider,
      braavos_initial_classhash,
      braavos_proxy_classhash,
      braavos_account_classhash
    );

    const accountDetails = await accountManager.createAccount();
    
    const suggestedMaxFee = await accountManager.estimateAccountDeployFee(accountDetails);
    const maxFee = suggestedMaxFee * 2n;

    return JSON.stringify({
      status: 'success',
      transaction_type: 'CREATE_ACCOUNT',
      wallet: 'Braavos',
      publicKey: accountDetails.publicKey,
      privateKey: accountDetails.privateKey,
      contractAddress: accountDetails.contractAddress,
      deployFee: maxFee.toString(),
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
