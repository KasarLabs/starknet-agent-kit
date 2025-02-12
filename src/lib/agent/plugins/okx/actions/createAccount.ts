import { RpcProvider } from 'starknet';
import { okx_classhash } from '../constant/contract';
import { AccountManager } from '../../core/account/utils/AccountManager';

export const CreateOKXAccount = async () => {
  try {
    const accountManager = new AccountManager(undefined);
    const accountDetails = await accountManager.createAccount(okx_classhash);

    return JSON.stringify({
      status: 'success',
      wallet: 'OKX',
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

export const CreateOKXAccountSignature = async () => {
  try {
    const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });

    const accountManager = new AccountManager(provider);
    const accountDetails = await accountManager.createAccount(okx_classhash);
    const suggestedMaxFee = await accountManager.estimateAccountDeployFee(
      okx_classhash,
      accountDetails
    );
    const maxFee = suggestedMaxFee.suggestedMaxFee * 2n;

    return JSON.stringify({
      status: 'success',
      transaction_type: 'CREATE_ACCOUNT',
      wallet: 'OKX',
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
