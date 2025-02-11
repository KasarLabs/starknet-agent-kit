import {
  Account,
  CallData,
  CairoOption,
  CairoOptionVariant,
  CairoCustomEnum,
  RpcProvider,
  hash,
  constants,
  ec,
  stark,
} from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import {
  argentx_classhash,
  oz_classhash,
  braavos_account_classhash,
  braavos_proxy_classhash,
  braavos_intiial_classhash,
  okx_classhash,
} from '../contract/constants/contract';
import {
  DeployArgentParams,
  DeployOZAccountParams,
  DeployBraavosParams,
  DeployOKXParams,
} from './types/deployAccountTypes';

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

export const DeployBraavosAccount = async (
  agent: StarknetAgentInterface,
  params: DeployBraavosParams
) => {
  try {
    const provider = agent.getProvider();

    const initializer = CallData.compile({ public_key: params.publicKey });
    const constructorCalldata = CallData.compile({
      implementation_address: braavos_intiial_classhash,
      initializer_selector: hash.getSelectorFromName('initializer'),
      calldata: [...initializer]
    });

    const txHash = hash.calculateDeployAccountTransactionHash({
      contractAddress: params.precalculate_address,
      classHash: braavos_proxy_classhash,
      constructorCalldata: constructorCalldata,
      salt: params.publicKey,
      version: constants.TRANSACTION_VERSION.V2,
      maxFee: constants.ZERO,
      chainId: await provider.getChainId(),
      nonce: constants.ZERO
    });

    const parsedOtherSigner = [0, 0, 0, 0, 0, 0, 0];
    const { r, s } = ec.starkCurve.sign(
      hash.computeHashOnElements([txHash, braavos_account_classhash, ...parsedOtherSigner]),
      params.privateKey
    );

    const signature = [
      r.toString(),
      s.toString(),
      braavos_account_classhash.toString(),
      ...parsedOtherSigner.map(e => e.toString())
    ];

    const transaction = await provider.deployAccountContract(
      {
        classHash: braavos_proxy_classhash,
        constructorCalldata,
        addressSalt: params.publicKey,
        signature
      },
      {
        nonce: constants.ZERO,
        version: constants.TRANSACTION_VERSION.V2
      }
    );

    console.log(
      '✅ Braavos wallet deployed at:',
      transaction.contract_address,
      ' : ',
      transaction.transaction_hash
    );

    return {
      status: 'success',
      wallet: 'Braavos',
      transaction_hash: transaction.transaction_hash,
      contract_address: transaction.contract_address
    };
  } catch (error) {
    return {
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const DeployBraavosAccountSignature = async (
  params: DeployBraavosParams
) => {
  try {
    const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
    
    const initializer = CallData.compile({ public_key: params.publicKey });
    const constructorCalldata = CallData.compile({
      implementation_address: braavos_intiial_classhash,
      initializer_selector: hash.getSelectorFromName('initializer'),
      calldata: [...initializer]
    });

    const deployAccountPayload = {
      classHash: braavos_proxy_classhash,
      constructorCalldata,
      addressSalt: params.publicKey
    };

    const txHashForEstimate = hash.calculateDeployAccountTransactionHash({
      contractAddress: params.precalculate_address,
      classHash: braavos_proxy_classhash,
      constructorCalldata: constructorCalldata,
      salt: params.publicKey,
      version: constants.TRANSACTION_VERSION.V2,
      maxFee: constants.ZERO,
      chainId: await provider.getChainId(),
      nonce: constants.ZERO
    });

    const parsedOtherSigner = [0, 0, 0, 0, 0, 0, 0];
    const { r, s } = ec.starkCurve.sign(
      hash.computeHashOnElements([txHashForEstimate, braavos_account_classhash, ...parsedOtherSigner]),
      params.privateKey
    );

    const signatureForEstimate = [
      r.toString(),
      s.toString(),
      braavos_account_classhash.toString(),
      ...parsedOtherSigner.map(e => e.toString())
    ];

    const estimatedFee = await provider.getDeployAccountEstimateFee(
      { ...deployAccountPayload, signature: signatureForEstimate },
      { version: constants.TRANSACTION_VERSION.V2, nonce: constants.ZERO }
    );

    const maxFee = stark.estimatedFeeToMaxFee(estimatedFee.overall_fee);

    const transaction = await provider.deployAccountContract(
      {
        classHash: braavos_proxy_classhash,
        constructorCalldata,
        addressSalt: params.publicKey,
        signature: signatureForEstimate
      },
      {
        nonce: constants.ZERO,
        maxFee,
        version: constants.TRANSACTION_VERSION.V2
      }
    );

    console.log(
      '✅ Braavos wallet with signature deployed at:',
      transaction.contract_address,
      ' : ',
      transaction.transaction_hash
    );

    return JSON.stringify({
      status: 'success',
      wallet: 'Braavos',
      transaction_hash: transaction.transaction_hash,
      contract_address: transaction.contract_address
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const DeployOKXAccount = async (
  agent: StarknetAgentInterface,
  params: DeployOKXParams
) => {
  try {
    const provider = agent.getProvider();
    const OKXaccountConstructorCallData = CallData.compile({
      publicKey: params.publicKey,
    });
    
    const OKXaccount = new Account(
      provider,
      params.precalculate_address,
      params.privateKey
    );

    const transaction = await OKXaccount.deployAccount({
      classHash: okx_classhash,
      constructorCalldata: OKXaccountConstructorCallData,
      addressSalt: params.publicKey,
    });
    
    console.log(
      '✅ OKX wallet deployed at:',
      transaction.contract_address,
      ' : ',
      transaction.transaction_hash
    );
    
    return {
      status: 'success',
      wallet: 'OKX',
      transaction_hash: transaction.transaction_hash,
      contract_address: transaction.contract_address
    };
  } catch (error) {
    return {
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const DeployOKXAccountSignature = async (
  params: DeployOKXParams
) => {
  try {
    const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
    const OKXaccountConstructorCallData = CallData.compile({
      publicKey: params.publicKey,
    });
    
    const OKXaccount = new Account(
      provider,
      params.precalculate_address,
      params.privateKey
    );

    const suggestedMaxFee = await OKXaccount.estimateAccountDeployFee({
      classHash: okx_classhash,
      constructorCalldata: OKXaccountConstructorCallData,
      contractAddress: params.precalculate_address,
    });

    const transaction = await OKXaccount.deployAccount({
      classHash: okx_classhash,
      constructorCalldata: OKXaccountConstructorCallData,
      addressSalt: params.publicKey,
    }, {
      maxFee: suggestedMaxFee.suggestedMaxFee.toString()
    });
    
    console.log(
      '✅ OKX wallet with signature deployed at:',
      transaction.contract_address,
      ' : ',
      transaction.transaction_hash
    );
    
    return JSON.stringify({
      status: 'success',
      wallet: 'OKX',
      transaction_hash: transaction.transaction_hash,
      contract_address: transaction.contract_address,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
