import { ec, stark, hash, CallData, Account, RpcProvider } from 'starknet';
import {
  argentx_classhash,
  oz_classhash,
  DEFAULT_GUARDIAN,
} from 'src/lib/utils/constants/contract';

export const CreateOZAccount = async () => {
  try {
    const privateKey = stark.randomAddress();
    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);

    const OZaccountClassHash = oz_classhash;
    const OZaccountConstructorCallData = CallData.compile({
      publicKey: starkKeyPub,
    });
    const OZcontractAddress = hash.calculateContractAddressFromHash(
      starkKeyPub,
      OZaccountClassHash,
      OZaccountConstructorCallData,
      0
    );
    return JSON.stringify({
      status: 'success',
      wallet: 'Open Zeppelin',
      new_account_publickey: OZcontractAddress,
      new_account_privatekey: privateKey,
      precalculate_address: OZcontractAddress,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const CreateArgentAccount = async () => {
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
    return JSON.stringify({
      status: 'success',
      wallet: 'Argent',
      new_account_publickey: starkKeyPubAX,
      new_account_privatekey: privateKeyAX,
      precalculate_address: AXcontractAddress,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const CreateArgentAccountCallData = async () => {
  try {
    const argentXaccountClassHash = argentx_classhash;
    const provider = new RpcProvider({ nodeUrl: process.env.RPC_URL });

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

    const accountAx = new Account(provider, starkKeyPubAX, privateKeyAX);
    const suggestedMaxFee = await accountAx.estimateAccountDeployFee({
      classHash: argentx_classhash,
      constructorCalldata: AXConstructorCallData,
      contractAddress: AXcontractAddress,
    });

    return JSON.stringify({
      status: 'success',
      transaction_type: 'Create_Account',
      wallet: 'Argent',
      public_key: starkKeyPubAX,
      private_key: privateKeyAX,
      contractaddress: AXcontractAddress,
      deploy_fee: suggestedMaxFee.suggestedMaxFee.toString(),
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
