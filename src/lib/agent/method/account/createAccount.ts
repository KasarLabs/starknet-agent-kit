import { ec, stark, hash, CallData } from 'starknet';
import {
  argentx_classhash,
  DEFAULT_GUARDIAN,
} from 'src/lib/utils/constants/contract';

export const CreateOZAccount = async () => {
  try {
    const privateKey = stark.randomAddress();
    console.log('Random private Key :' + privateKey);
    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
    console.log('publicKey=', starkKeyPub);

    const OZaccountClassHash =
      '0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f';
    const OZaccountConstructorCallData = CallData.compile({
      publicKey: starkKeyPub,
    });
    const OZcontractAddress = hash.calculateContractAddressFromHash(
      starkKeyPub,
      OZaccountClassHash,
      OZaccountConstructorCallData,
      0
    );
    console.log('Precalculated account address=', OZcontractAddress);
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
