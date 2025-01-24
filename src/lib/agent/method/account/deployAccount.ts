import {
  argentx_classhash,
  DEFAULT_GUARDIAN,
} from 'src/lib/utils/constants/contract';
import {
  Account,
  RpcProvider,
  hash,
  CallData,
  stark,
  ec,
  TransactionFinalityStatus,
  shortString,
  RawArgs,
} from 'starknet';
import { AccountDetails } from 'src/lib/utils/types';
import {
  DeployOZAccountParams,
  DeployArgentParams,
} from 'src/lib/utils/types/deployaccount';
import { StarknetAgentInterface } from 'src/lib/agent/tools';
import { CreateArgentAccount } from './createAccount';
import { create } from 'domain';
import { estimateAccountDeployFee } from './estimateAccountDeployFee';

export const DeployOZAccount = async (
  agent: StarknetAgentInterface,
  params: DeployOZAccountParams
) => {
  try {
    const provider = agent.getProvider();
    const accountCredentials = agent.getAccountCredentials();
    const accountAddress = accountCredentials?.accountPublicKey;
    const accountPrivateKey = accountCredentials?.accountPrivateKey;
    const accountDetails: AccountDetails = {
      publicKey: accountAddress,
      privateKey: accountPrivateKey,
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

export const DeployArgentAccount = async (
  agent: StarknetAgentInterface,
  params: DeployArgentParams
) => {
  const provider = agent.getProvider();

  try {
    const argentXaccountClassHash = argentx_classhash;

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

const provider = new RpcProvider({ nodeUrl: process.env.RPC_URL });

export const CreateArgentAccountCallData = async () => {
  try {
    const argentXaccountClassHash = argentx_classhash;

    const privateKeyAX = stark.randomAddress();
    const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);

    const AXConstructorCallData = CallData.compile({
      owner: starkKeyPubAX,
      guardian: DEFAULT_GUARDIAN,
    });
    const AXcontractAddress = hash.calculateContractAddressFromHash(
      starkKeyPubAX,
      argentXaccountClassHash,
      AXConstructorCallData,
      0
    );
    return {
      status: 'success',
      wallet: 'Argent',
      new_account_publickey: starkKeyPubAX,
      new_account_privatekey: privateKeyAX,
      precalculate_address: AXcontractAddress,
    };
  } catch (error) {
    return {
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

const stringToRawArgs = (str: string): RawArgs => {
  return {
    raw: [str],
  };
};

export const create_deploy_argent_account = async () => {
  try {
    const create_account = await CreateArgentAccountCallData();
    if (create_account.status == 'failure') {
      throw new Error('Erreur at createArgentAccount');
    }
    const accountAx = new Account(
      provider,
      create_account.precalculate_address as string,
      create_account.new_account_privatekey as string
    );
    const estimate_fee = await accountAx.estimateAccountDeployFee({
      classHash: argentx_classhash,
      constructorCalldata: stringToRawArgs(
        create_account.new_account_publickey as string
      ),
    });
    const deployAccountPayload = {
      type: 'DEPLOY_ACCOUNT',
      account: {
        private_key: create_account.new_account_privatekey,
        public_key: create_account.new_account_publickey,
        contractaddress: create_account.precalculate_address,
      },
      payload: {
        classHash: argentx_classhash,
        constructorCalldata: [create_account.new_account_publickey, 0x0],
        unique: true,
      },
    };
    console.log(deployAccountPayload);
    return {
      deployAccountPayload,
    };
  } catch (error) {
    console.log(error);
  }
};
