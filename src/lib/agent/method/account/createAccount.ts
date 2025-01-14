import { ec, stark, hash, CallData } from 'starknet';
import { StarknetAgent } from 'src/lib/agent/starknetAgent';

export const CreateOZAccount = async () => {
  try {
    const accountManager = new StarknetAgent({
      walletPrivateKey: process.env.PRIVATE_KEY,
      aiProviderApiKey: process.env.AI_PROVIDER_API_KEY,
      aiModel: process.env.AI_MODEL,
      aiProvider: process.env.AI_PROVIDER,
    }).accountManager;

    const accountDetails = await accountManager.createAccount();

    return JSON.stringify({
      status: 'success',
      wallet: 'Open Zeppelin',
      new_account_publickey: accountDetails.publicKey,
      new_account_privatekey: accountDetails.privateKey,
      precalculate_address: accountDetails.address,
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
    const argentXaccountClassHash =
      '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003';

    // Generate public and private key pair.
    const privateKeyAX = stark.randomAddress();
    const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);

    // Calculate future address of the ArgentX account
    const AXConstructorCallData = CallData.compile({
      owner: starkKeyPubAX,
      guardian: '0x0',
    });
    const AXcontractAddress = hash.calculateContractAddressFromHash(
      starkKeyPubAX,
      argentXaccountClassHash,
      AXConstructorCallData,
      0
    );
    return JSON.stringify({
      status: 'success',
      new_account_publickey: starkKeyPubAX,
      new_account_privatekey: privateKeyAX,
      precalculate_address: AXcontractAddress,
      wallet: 'Argent',
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
