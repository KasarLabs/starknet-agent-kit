import { RpcProvider } from 'starknet';
import { argentx_classhash } from '../constant/contract';
import { AccountManager } from '../utils/AccountManager';
  
export const CreateAXAccount = async () => {
    try {
        const accountManager = new AccountManager(undefined);
        const accountDetails = await accountManager.createAccount(argentx_classhash);

        return JSON.stringify({
            deployStatus: 'success',
            wallet: 'AX',
            publicKey: accountDetails.publicKey,
            privateKey: accountDetails.privateKey,
            contractAddress: accountDetails.contractAddress,
        });
        } catch (error) {
        return JSON.stringify({
            deployStatus: 'failure',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export const CreateAXAccountSignature = async () => {
    try {
        const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
            
        const accountManager = new AccountManager(provider);
        const accountDetails = await accountManager.createAccount(argentx_classhash);
        const suggestedMaxFee = await accountManager.estimateAccountDeployFee(argentx_classhash, accountDetails);
        const maxFee = suggestedMaxFee.suggestedMaxFee * 2n;

        return JSON.stringify({
            deployStatus: 'success',
            transaction_type: 'CREATE_ACCOUNT',
            wallet: 'AX',
            publicKey: accountDetails.publicKey,
            privateKey: accountDetails.privateKey,
            contractAddress: accountDetails.contractAddress,
            deployFee: maxFee.toString(),
        });
    } catch (error) {
        return JSON.stringify({
            deployStatus: 'failure',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

  