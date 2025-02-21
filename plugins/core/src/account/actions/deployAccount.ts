import {
  Account,
  CallData,
  CairoOption,
  CairoOptionVariant,
  CairoCustomEnum,
  RpcProvider,
} from 'starknet';
import { StarknetAgentInterface } from '@starknet-agent-kit/agent';
import {
  argentx_classhash,
  oz_classhash,
} from '../../contract/constants/contract';
import {
  DeployArgentParams,
  DeployOZAccountParams,
} from '../types/deployAccountTypes';

export const DeployOZAccount = async (
  agent: StarknetAgentInterface,
  params: DeployOZAccountParams
) => {
  try {
    const provider = agent.getProvider();
    const OZaccountConstructorCallData = CallData.compile({
      publicKey: params.publicKey,
    });
    const OZaccount = new Account(
      provider,
      params.precalculate_address,
      params.privateKey
    );

    const transaction = await OZaccount.deployAccount({
      classHash: oz_classhash,
      constructorCalldata: OZaccountConstructorCallData,
      addressSalt: params.publicKey,
    });
    console.log(
      '✅ Open Zeppelin wallet deployed at:',
      transaction.contract_address,
      ' : ',
      transaction.transaction_hash
    );
    return {
      status: 'success',
      wallet: 'OpenZeppelin',
      transaction_hash: transaction.transaction_hash,
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
    const provider = agent.getProvider();
    const accountAX = new Account(
      provider,
      params.publicKeyAX,
      params.privateKeyAX
    );
    const axSigner = new CairoCustomEnum({
      Starknet: { pubkey: params.publicKeyAX },
    });
    const axGuardian = new CairoOption<unknown>(CairoOptionVariant.None);

    const AXConstructorCallData = CallData.compile({
      owner: axSigner,
      guardian: axGuardian,
    });
    const deployAccountPayload = {
      classHash: argentx_classhash,
      constructorCalldata: AXConstructorCallData,
      contractAddress: params.precalculate_address,
      addressSalt: params.publicKeyAX,
    };

    const AXcontractFinalAddress =
      await accountAX.deployAccount(deployAccountPayload);
    console.log('✅ ArgentX wallet deployed at:', AXcontractFinalAddress);

    return {
      status: 'success',
      wallet: 'ArgentX',
      contract_address: AXcontractFinalAddress.contract_address,
      transaction_hash: AXcontractFinalAddress.transaction_hash,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const DeployArgentAccountSignature = async (
  params: DeployArgentParams
) => {
  try {
    const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
    const accountAX = new Account(
      provider,
      params.publicKeyAX,
      params.privateKeyAX
    );
    const axSigner = new CairoCustomEnum({
      Starknet: { pubkey: params.publicKeyAX },
    });
    const axGuardian = new CairoOption<unknown>(CairoOptionVariant.None);

    const AXConstructorCallData = CallData.compile({
      owner: axSigner,
      guardian: axGuardian,
    });
    const deployAccountPayload = {
      classHash: argentx_classhash,
      constructorCalldata: AXConstructorCallData,
      contractAddress: params.precalculate_address,
      addressSalt: params.publicKeyAX,
    };

    const suggestedMaxFee = await accountAX.estimateAccountDeployFee({
      classHash: argentx_classhash,
      constructorCalldata: AXConstructorCallData,
      contractAddress: params.precalculate_address,
    });
    const AXcontractFinalAddress = await accountAX.deployAccount(
      deployAccountPayload,
      { maxFee: suggestedMaxFee.suggestedMaxFee.toString() }
    );
    console.log(
      '✅ ArgentXSignature wallet deployed at:',
      AXcontractFinalAddress
    );

    return JSON.stringify({
      status: 'success',
      wallet: 'ArgentX',
      contract_address: AXcontractFinalAddress.contract_address,
      transaction_hash: AXcontractFinalAddress.transaction_hash,
    });
  } catch (error) {
    console.log(error);
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const DeployOZAccountSignature = async (
  params: DeployOZAccountParams
) => {
  try {
    const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
    const OZaccountConstructorCallData = CallData.compile({
      publicKey: params.publicKey,
    });
    const OZaccount = new Account(
      provider,
      params.precalculate_address,
      params.privateKey
    );

    const transaction = await OZaccount.deployAccount({
      classHash: oz_classhash,
      constructorCalldata: OZaccountConstructorCallData,
      addressSalt: params.publicKey,
    });
    console.log(
      '✅ Open Zeppelin wallet deployed at:',
      transaction.contract_address,
      ' : ',
      transaction.transaction_hash
    );
    return JSON.stringify({
      status: 'success',
      wallet: 'OpenZeppelin',
      transaction_hash: transaction.transaction_hash,
      contract_address: transaction.contract_address,
    });
  } catch (error) {
    return {
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
