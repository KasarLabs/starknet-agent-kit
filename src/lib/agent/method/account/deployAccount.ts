import { RPC_URL } from 'src/lib/constant';
import {
  Account,
  RpcProvider,
  hash,
  CallData,
  TransactionFinalityStatus,
} from 'starknet';
import { StarknetAgent } from '../../starknetAgent';
import { AccountDetails } from 'src/lib/utils/types';

const provider = new RpcProvider({ nodeUrl: RPC_URL });

export type DeployOZAccountParams = {
  publicKey: string;
  privateKey: string;
};

export const DeployOZAccount = async (params: DeployOZAccountParams) => {
  try {
    const agent = new StarknetAgent({
      walletPrivateKey: process.env.STARKNET_PRIVATE_KEY,
      aiProviderApiKey: process.env.AI_PROVIDER_API_KEY,
      aiModel: process.env.AI_MODEL,
      aiProvider: process.env.AI_PROVIDER,
    });

    const accountDetails: AccountDetails = {
      publicKey: params.publicKey,
      privateKey: params.privateKey,
      address: '', // Will be calculated during deployment
      deployStatus: false,
    };

    // Calculate deployment fee with max fee estimation
    const { suggestedMaxFee } =
      await agent.accountManager.estimateAccountDeployFee(accountDetails);
    console.log('Estimated max deployment fee:', suggestedMaxFee);

    // Deploy the account with the estimated fee
    const deployResponse =
      await agent.accountManager.deployAccount(accountDetails);

    if (!deployResponse.transactionHash) {
      throw new Error('No transaction hash returned from deployment');
    }

    // Wait for transaction confirmation
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

export type DeployArgentParams = {
  publicKeyAX: string;
  privateKeyAX: string;
};

export const DeployArgentAccount = async (params: DeployArgentParams) => {
  try {
    // Use a specific class hash for Argent account
    const argentXaccountClassHash =
      '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003';

    // Prepare constructor calldata
    const constructorCalldata = CallData.compile({
      owner: params.publicKeyAX,
      guardian: '0x0', // Use hex string for consistency
    });

    // Calculate the contract address
    const contractAddress = hash.calculateContractAddressFromHash(
      params.publicKeyAX,
      argentXaccountClassHash,
      constructorCalldata,
      0
    );

    // Create account instance
    const account = new Account(provider, contractAddress, params.privateKeyAX);

    // Prepare deployment payload
    const deployAccountPayload = {
      classHash: argentXaccountClassHash,
      constructorCalldata: constructorCalldata,
      contractAddress: contractAddress,
      addressSalt: params.publicKeyAX,
    };

    // Deploy the account
    const { transaction_hash, contract_address } =
      await account.deployAccount(deployAccountPayload);

    // Wait for deployment confirmation
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
