import { RPC_URL } from 'src/lib/utils/constants/constant';
import {
  argentx_classhash,
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
import { StarknetAgentInterface } from '../../tools';

const provider = new RpcProvider({ nodeUrl: RPC_URL });

export const DeployOZAccount = async (
  agent: StarknetAgentInterface,
  params: DeployOZAccountParams
) => {
  try {
    const accountCredentials = agent.getAccountCredentials();
    const accountAddress = accountCredentials?.accountPublicKey;
    const accountPrivateKey = accountCredentials?.accountPrivateKey;
    const accountDetails: AccountDetails = {
      publicKey: accountAddress,
      privateKey: accountPrivateKey,
      address: '',
      deployStatus: false,
    };

    const { suggestedMaxFee } = await agent.accountManager.estimateAccountDeployFee(accountDetails);
    console.log('Estimated max deployment fee:', suggestedMaxFee);

    const deployResponse = await agent.accountManager.deployAccount(accountDetails);

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

const aiProvider = process.env.AI_PROVIDER;
if (!['openai', 'anthropic', 'ollama', 'gemini'].includes(aiProvider)) {
  throw new Error('Invalid AI provider');
}
