import {
    Account,
    ec,
    stark,
    RpcProvider,
    hash,
    CallData,
  } from 'starknet';
  import {
    okx_classhash
  } from '../constant/contract';
  
  export const CreateOKXAccount = async (): Promise<string> => {
    try {
      const privateKey = stark.randomAddress();
      console.log('New OKX account:\nprivateKey=', privateKey);
      const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
      console.log('publicKey=', starkKeyPub);
  
      const OKXaccountConstructorCallData = CallData.compile({
        publicKey: starkKeyPub
      });
      
      const OKXcontractAddress = hash.calculateContractAddressFromHash(
        starkKeyPub,
        okx_classhash,
        OKXaccountConstructorCallData,
        0
      );
      console.log('Precalculated account address=', OKXcontractAddress);
      
      return JSON.stringify({
        status: 'success',
        wallet: 'OKX',
        new_account_publickey: starkKeyPub,
        new_account_privatekey: privateKey,
        precalculate_address: OKXcontractAddress,
      });
    } catch (error) {
      return JSON.stringify({
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
  
  export const CreateOKXAccountSignature = async () => {
    try {
      const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
      
      const privateKey = stark.randomAddress();
      console.log('New OKX account:\nprivateKey=', privateKey);
      const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
      console.log('publicKey=', starkKeyPub);
  
      const OKXaccountConstructorCallData = CallData.compile({
        publicKey: starkKeyPub
      });
      
      const OKXcontractAddress = hash.calculateContractAddressFromHash(
        starkKeyPub,
        okx_classhash,
        OKXaccountConstructorCallData,
        0
      );
      console.log('Precalculated account address=', OKXcontractAddress);
  
      console.log("HERE1");
      const accountOKX = new Account(provider, OKXcontractAddress, privateKey, undefined, "0x3");
      console.log("HERE2");
      const deployAccountPayload = {
        classHash: okx_classhash,
        constructorCalldata: OKXaccountConstructorCallData,
        contractAddress: OKXcontractAddress,
        addressSalt: starkKeyPub,
        version: 3
      };
      console.log("HERE3");
      const suggestedMaxFee = await accountOKX.estimateAccountDeployFee(deployAccountPayload);
    
      const maxFee = suggestedMaxFee.suggestedMaxFee * 2n;
      console.log("HERE4");
      return JSON.stringify({
        status: 'success',
        transaction_type: 'CREATE_ACCOUNT',
        wallet: 'OKX',
        public_key: starkKeyPub,
        private_key: privateKey,
        contractaddress: OKXcontractAddress,
        deploy_fee: maxFee.toString(),
      });
    } catch (error) {
      return JSON.stringify({
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
  