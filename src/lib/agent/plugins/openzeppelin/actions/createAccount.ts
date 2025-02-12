import {
    Account,
    ec,
    stark,
    RpcProvider,
    hash,
    CallData,
  } from 'starknet';
  import {
    oz_classhash
  } from '../constant/contract';
  
  export const CreateOZAccount = async () => {
    try {
      const privateKey = stark.randomAddress();
      console.log('New OZ account:\nprivateKey=', privateKey);
      const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
      console.log('publicKey=', starkKeyPub);
  
      const OZaccountConstructorCallData = CallData.compile({
        publicKey: starkKeyPub,
      });
      const OZcontractAddress = hash.calculateContractAddressFromHash(
        starkKeyPub,
        oz_classhash,
        OZaccountConstructorCallData,
        0
      );
      console.log('Precalculated account address=', OZcontractAddress);
      return JSON.stringify({
        status: 'success',
        wallet: 'Open Zeppelin',
        new_account_publickey: starkKeyPub,
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
  
  export const CreateOZAccountSignature = async () => {
    try {
      const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
  
      const privateKey = stark.randomAddress();
      console.log('New OZ account:\nprivateKey=', privateKey);
      const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
      console.log('publicKey=', starkKeyPub);
  
      const OZaccountConstructorCallData = CallData.compile({
        publicKey: starkKeyPub,
      });
  
      const OZcontractAddress = hash.calculateContractAddressFromHash(
        starkKeyPub,
        oz_classhash,
        OZaccountConstructorCallData,
        0
      );
      console.log('Precalculated account address=', OZcontractAddress);
  
      const accountOz = new Account(provider, OZcontractAddress, privateKey, undefined, "0x3");
      const deployAccountPayload = {
        classHash: oz_classhash,
        constructorCalldata: OZaccountConstructorCallData,
        contractAddress: OZcontractAddress,
        addressSalt: starkKeyPub,
        version: 3
      };
      const suggestedMaxFee = await accountOz.estimateAccountDeployFee(deployAccountPayload);
      
      const maxFee = suggestedMaxFee.suggestedMaxFee * 2n;
  
      console.log(`maxFee=${maxFee}`);
      return JSON.stringify({
        status: 'success',
        transaction_type: 'CREATE_ACCOUNT',
        wallet: 'OpenZeppelin',
        public_key: starkKeyPub,
        private_key: privateKey,
        contractaddress: OZcontractAddress,
        deploy_fee: maxFee.toString(),
      });
    } catch (error) {
      return JSON.stringify({
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
  