import { RpcProvider } from 'starknet';
import * as fs from 'fs';
import { CreateOZAccountSignature } from 'src/lib/agent/plugins/openzeppelin/actions/createAccount';
import { DeployOZAccountSignature } from 'src/lib/agent/plugins/openzeppelin/actions/deployAccount';

describe('OZ Account Creation and Deployment', () => {
  let provider: RpcProvider;

  beforeAll(() => {
    provider = new RpcProvider({
      nodeUrl: process.env.STARKNET_RPC_URL,
    });
  });

  it('should create a new account and save details', async () => {
    if (process.env.RUN_DEPLOYMENT_TEST) {
      console.log(
        'Creation test skipped. Set RUN_DEPLOYMENT_TEST=false to run it'
      );
      return;
    }

    const result = await CreateOZAccountSignature();

    const data = JSON.parse(result);

    if (data.status !== 'success') {
      console.log(data.error);
    }
    expect(data.status).toBe('success');
    expect(data.transaction_type).toBe('CREATE_ACCOUNT');
    expect(data.wallet).toBe('OpenZeppelin');

    expect(data.publicKey).toMatch(/^0x[a-fA-F0-9]+$/);
    expect(data.privateKey).toMatch(/^0x[a-fA-F0-9]+$/);
    expect(data.contractAddress).toMatch(/^0x[a-fA-F0-9]+$/);
  }, 30000); // 30 seconds timeout

  it('should deploy the account', async () => {
    if (!process.env.RUN_DEPLOYMENT_TEST) {
      console.log(
        'Deployment test skipped. Set RUN_DEPLOYMENT_TEST=true to run it'
      );
      return;
    }

    const accountDetails = {
      contractAddress: process.env.ADDRESS as string,
      publicKey: process.env.PUBLICKEY as string,
      privateKey: process.env.PRIVATEKEY as string,
    };

    const result = await DeployOZAccountSignature(accountDetails);

    const deployResult = JSON.parse(result);
    expect(deployResult.status).toBe('success');

    if (deployResult.status === 'success') {
      console.log('Account deployed successfully!');
      console.log('Transaction hash:', deployResult.transactionHash);
    } else {
      console.error('Deployment failed:', deployResult.error);
    }
  }, 300000); // 30 seconds timeout
});
