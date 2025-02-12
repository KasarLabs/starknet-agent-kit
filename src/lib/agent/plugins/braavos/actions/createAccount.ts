import {
    ec,
    stark,
    RpcProvider,
    hash,
    CallData,
    constants,
  } from 'starknet';
  import {
    braavos_intiial_classhash,
    braavos_account_classhash,
    braavos_proxy_classhash,
  } from '../constant/contract';
  
  export const CreateBraavosAccount = async (): Promise<string> => {
    try {
      const privateKey = stark.randomAddress();
      const publicKey = ec.starkCurve.getStarkKey(privateKey);
      
      const initializer = CallData.compile({ public_key: publicKey });
      const constructorCalldata = CallData.compile({
        implementation_address: braavos_intiial_classhash,
        initializer_selector: hash.getSelectorFromName('initializer'),
        calldata: [...initializer]
      });
  
      const address = hash.calculateContractAddressFromHash(
        publicKey,
        braavos_proxy_classhash,
        constructorCalldata,
        0
      );
  
      return JSON.stringify({
        status: 'success',
        wallet: 'Braavos',
        new_account_publickey: publicKey,
        new_account_privatekey: privateKey,
        precalculate_address: address,
      });
    } catch (error) {
      return JSON.stringify({
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  export const CreateBraavosAccountSignature = async () => {
    try {
        const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
    
        const privateKey = stark.randomAddress();
        console.log('New Braavos account:\nprivateKey=', privateKey);
        const publicKey = ec.starkCurve.getStarkKey(privateKey);
        console.log('publicKey=', publicKey);
    
        const initializer = CallData.compile({ public_key: publicKey });
        const constructorCalldata = CallData.compile({
            implementation_address: braavos_intiial_classhash,
            initializer_selector: hash.getSelectorFromName('initializer'),
            calldata: [...initializer]
        });
    
        const contractAddress = hash.calculateContractAddressFromHash(
            publicKey,
            braavos_proxy_classhash,
            constructorCalldata,
            0
        );
    
        const chainId = await provider.getChainId();
        const txHashForEstimate = hash.calculateDeployAccountTransactionHash({
            contractAddress: contractAddress,
            classHash: braavos_proxy_classhash,
            constructorCalldata: constructorCalldata,
            salt: publicKey,
            version: constants.TRANSACTION_VERSION.V2,
            maxFee: constants.ZERO,
            chainId: chainId,
            nonce: constants.ZERO
        });
    
        const parsedOtherSigner = [0, 0, 0, 0, 0, 0, 0];
        const { r, s } = ec.starkCurve.sign(
            hash.computeHashOnElements([txHashForEstimate, braavos_account_classhash, ...parsedOtherSigner]),
            privateKey
        );
    
        const signatureForEstimate = [
            r.toString(),
            s.toString(),
            braavos_account_classhash.toString(),
            ...parsedOtherSigner.map(e => e.toString())
        ];
    
        const deployAccountPayload = {
            classHash: braavos_proxy_classhash,
            constructorCalldata,
            addressSalt: publicKey,
            contractAddress,
            version: constants.TRANSACTION_VERSION.V3,
            nonce: constants.ZERO,
            maxFee: constants.ZERO 
        };
    
        const estimatedFee = await provider.getDeployAccountEstimateFee(
            { ...deployAccountPayload, signature: signatureForEstimate },
            { version: constants.TRANSACTION_VERSION.V3, nonce: constants.ZERO }
        );
        const maxFee = stark.estimatedFeeToMaxFee(estimatedFee.overall_fee) * 2n;
  
        console.log('Precalculated account address=', contractAddress);
        return JSON.stringify({
            status: 'success',
            transaction_type: 'CREATE_ACCOUNT',
            wallet: 'Braavos',
            public_key: publicKey,
            private_key: privateKey,
            contractaddress: contractAddress,
            deploy_fee: maxFee.toString(),
        });
    } catch (error) {
        return JSON.stringify({
            status: 'failure',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
  };