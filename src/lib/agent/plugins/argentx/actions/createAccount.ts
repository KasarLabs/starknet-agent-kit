import {
    Account,
    ec,
    stark,
    RpcProvider,
    hash,
    CallData,
    CairoOption,
    CairoOptionVariant,
    CairoCustomEnum,
  } from 'starknet';
  import {
    argentx_classhash,
  } from '../constant/contract';
  
  export const CreateArgentAccount = async () => {
    try {
      const privateKeyAX = stark.randomAddress();
      console.log('AX_ACCOUNT_PRIVATE_KEY=', privateKeyAX);
      const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);
      console.log('AX_ACCOUNT_PUBLIC_KEY=', starkKeyPubAX);
  
      const axSigner = new CairoCustomEnum({
        Starknet: { pubkey: starkKeyPubAX },
      });
      const axGuardian = new CairoOption<unknown>(CairoOptionVariant.None);
  
      const AXConstructorCallData = CallData.compile({
        owner: axSigner,
        guardian: axGuardian,
      });
      const AXcontractAddress = hash.calculateContractAddressFromHash(
        starkKeyPubAX,
        argentx_classhash,
        AXConstructorCallData,
        0
      );
      console.log('Precalculated account address=', AXcontractAddress);
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
  
  export const CreateArgentAccountSignature = async () => {
    try {
      const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
      const privateKeyAX = stark.randomAddress();
      console.log('AX_ACCOUNT_PRIVATE_KEY=', privateKeyAX);
      const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);
      console.log('AX_ACCOUNT_PUBLIC_KEY=', starkKeyPubAX);
  
      const axSigner = new CairoCustomEnum({
        Starknet: { pubkey: starkKeyPubAX },
      });
      const axGuardian = new CairoOption<unknown>(CairoOptionVariant.None);
      const AXConstructorCallData = CallData.compile({
        owner: axSigner,
        guardian: axGuardian,
      });
  
      const AXcontractAddress = hash.calculateContractAddressFromHash(
        starkKeyPubAX,
        argentx_classhash,
        AXConstructorCallData,
        0
      );
      console.log('Precalculated account address=', AXcontractAddress);
  
      const accountAx = new Account(provider, AXcontractAddress, privateKeyAX, undefined, "0x3");
      const deployAccountPayload = {
        classHash: argentx_classhash,
        constructorCalldata: AXConstructorCallData,
        contractAddress: AXcontractAddress,
        addressSalt: starkKeyPubAX,
        version: 3
      };
      const suggestedMaxFee = await accountAx.estimateAccountDeployFee(deployAccountPayload);
  
      const maxFee = suggestedMaxFee.suggestedMaxFee * 2n;
    
      return JSON.stringify({
        status: 'success',
        transaction_type: 'CREATE_ACCOUNT',
        wallet: 'Argent',
        public_key: starkKeyPubAX,
        private_key: privateKeyAX,
        contractaddress: AXcontractAddress,
        deploy_fee: maxFee.toString(),
      });
    } catch (error) {
      return JSON.stringify({
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };