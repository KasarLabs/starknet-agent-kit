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
  constants,
} from 'starknet';
import {
  argentx_classhash,
  oz_classhash,
  braavos_intiial_classhash,
  braavos_account_classhash,
  braavos_proxy_classhash,
  okx_classhash
} from '../contract/constants/contract';

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

    const deployAccountPayload = {
      classHash: braavos_proxy_classhash,
      constructorCalldata,
      addressSalt: publicKey,
      contractAddress
    };

    const txHashForEstimate = hash.calculateDeployAccountTransactionHash({
        contractAddress: contractAddress,
        classHash: braavos_proxy_classhash,
        constructorCalldata: constructorCalldata,
        salt: publicKey,
        version: constants.TRANSACTION_VERSION.V2,
        maxFee: constants.ZERO,
        chainId: await provider.getChainId(),
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

    const estimatedFee = await provider.getDeployAccountEstimateFee(
      { ...deployAccountPayload, signature: signatureForEstimate },
      { version: constants.TRANSACTION_VERSION.V2, nonce: constants.ZERO }
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
      deploy_fee: maxFee.toString()
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


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

    const accountOKX = new Account(provider, OKXcontractAddress, privateKey, undefined, "0x3");
    const deployAccountPayload = {
      classHash: okx_classhash,
      constructorCalldata: OKXaccountConstructorCallData,
      contractAddress: OKXcontractAddress,
      addressSalt: starkKeyPub,
      version: 3
    };
    const suggestedMaxFee = await accountOKX.estimateAccountDeployFee(deployAccountPayload);
  
    const maxFee = suggestedMaxFee.suggestedMaxFee * 2n;
    
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
