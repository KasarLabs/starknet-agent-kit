import { RPC_URL } from 'src/lib/utils/constants/constant';
import {
  ARGENTXCLASSHASH,
  DEFAULT_GUARDIAN,
} from 'src/lib/utils/constants/contract';
import {
  Account,
  RpcProvider,
  hash,
  CallData,
  TransactionFinalityStatus,
} from 'starknet';
import { StarknetAgent } from 'src/lib/agent/starknetAgent';
import { AccountDetails } from 'src/lib/utils/types';
import {
  DeployOZAccountParams,
  DeployArgentParams,
} from 'src/lib/utils/types/deployaccount';

const provider = new RpcProvider({ nodeUrl: RPC_URL });

export const DeployOZAccount = async (params: DeployOZAccountParams) => {
  try {
    const agent = new StarknetAgent({
      walletPrivateKey: process.env.PRIVATE_KEY,
      aiProviderApiKey: process.env.AI_PROVIDER_API_KEY,
      aiModel: process.env.AI_MODEL,
      aiProvider: process.env.AI_PROVIDER,
    });

    const accountDetails: AccountDetails = {
      publicKey: params.publicKey,
      privateKey: params.privateKey,
      address: '',
      deployStatus: false,
    };

    const { suggestedMaxFee } =
      await agent.accountManager.estimateAccountDeployFee(accountDetails);
    console.log('Estimated max deployment fee:', suggestedMaxFee);

    const deployResponse =
      await agent.accountManager.deployAccount(accountDetails);

    if (!deployResponse.transactionHash) {
      throw new Error('No transaction hash returned from deployment');
    }

    const receipt = await provider.waitForTransaction(
      deployResponse.transactionHash,
      {
        retryInterval: 5000,
        successStates: [TransactionFinalityStatus.ACCEPTED_ON_L1],
      }
    );

    return {
      status: 'success',
      wallet: 'Open Zeppelin',
      transaction_hash: deployResponse.transactionHash,
      receipt: receipt,
    };
  } catch (error) {
    return {
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const DeployArgentAccount = async (params: DeployArgentParams) => {
  try {
    const argentXaccountClassHash = ARGENTXCLASSHASH;

    const constructorCalldata = CallData.compile({
      owner: params.publicKeyAX,
      guardian: DEFAULT_GUARDIAN,
    });

    const contractAddress = hash.calculateContractAddressFromHash(
      params.publicKeyAX,
      argentXaccountClassHash,
      constructorCalldata,
      0
    );

    const account = new Account(provider, contractAddress, params.privateKeyAX);

    const deployAccountPayload = {
      classHash: argentXaccountClassHash,
      constructorCalldata: constructorCalldata,
      contractAddress: contractAddress,
      addressSalt: params.publicKeyAX,
    };

    const { transaction_hash, contract_address } =
      await account.deployAccount(deployAccountPayload);

    await provider.waitForTransaction(transaction_hash, {
      retryInterval: 5000,
      successStates: [TransactionFinalityStatus.ACCEPTED_ON_L1],
    });

    return {
      status: 'success',
      wallet: 'Argent X',
      transaction_hash,
      contract_address,
    };
  } catch (error) {
    return {
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
