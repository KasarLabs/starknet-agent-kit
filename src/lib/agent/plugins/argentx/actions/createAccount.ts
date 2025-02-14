import { RpcProvider } from 'starknet';
import { argentx_classhash } from '../constant/contract';
import { AccountManager } from '../utils/AccountManager';

/**
 * Creates a new ArgentX account.
 * @async
 * @function CreateAXAccount
 * @returns {Promise<string>} JSON string with account details
 * @throws {Error} If account creation fails
 */
export const CreateAXAccount = async () => {
  try {
    const accountManager = new AccountManager(undefined);
    const accountDetails = await accountManager.createAccount(argentx_classhash);

    return JSON.stringify({
      status: 'success',
      wallet: 'AX',
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

/**
 * Creates an ArgentX account with deployment fee estimation.
 * @async
 * @function CreateAXAccountSignature
 * @returns {Promise<string>} JSON string with account and fee details
 * @throws {Error} If creation or fee estimation fails
 */
export const CreateAXAccountSignature = async () => {
  try {
    const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });

    const accountManager = new AccountManager(provider);
    const accountDetails =
      await accountManager.createAccount(argentx_classhash);
    const suggestedMaxFee = await accountManager.estimateAccountDeployFee(
      argentx_classhash,
      accountDetails
    );
    const maxFee = suggestedMaxFee.suggestedMaxFee * 2n;

    return JSON.stringify({
      status: 'success',
      transaction_type: 'CREATE_ACCOUNT',
      wallet: 'AX',
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
