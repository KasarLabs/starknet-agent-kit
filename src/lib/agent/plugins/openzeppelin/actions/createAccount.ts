import { RpcProvider } from 'starknet';
import { oz_classhash } from '../constant/contract';
import { AccountManager } from '../../core/account/utils/AccountManager';
  
export const CreateOZAccount = async () => {
    try {
        const accountManager = new AccountManager(undefined);
        const accountDetails = await accountManager.createAccount(oz_classhash);

        return JSON.stringify({
            deployStatus: 'success',
            wallet: 'Open Zeppelin',
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

export const CreateOZAccountSignature = async () => {
    try {
        const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
            
        const accountManager = new AccountManager(provider);
        const accountDetails = await accountManager.createAccount(oz_classhash);
        const suggestedMaxFee = await accountManager.estimateAccountDeployFee(oz_classhash, accountDetails);
        const maxFee = suggestedMaxFee.suggestedMaxFee * 2n;

        return JSON.stringify({
            deployStatus: 'success',
            transaction_type: 'CREATE_ACCOUNT',
            wallet: 'OpenZeppelin',
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
