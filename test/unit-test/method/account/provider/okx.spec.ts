import { RpcProvider } from 'starknet';
import * as fs from 'fs';
import { CreateOKXAccountSignature } from 'src/lib/agent/plugins/okx/actions/createAccount';
import { DeployOKXAccountSignature } from 'src/lib/agent/plugins/okx/actions/deployAccount';

describe('OKX Account Creation and Deployment', () => {
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

    const result = await CreateOKXAccountSignature();

    const data = JSON.parse(result);

    if (data.status !== 'success') {
      console.log(data.error);
    }
    expect(data.status).toBe('success');
    expect(data.transaction_type).toBe('CREATE_ACCOUNT');
    expect(data.wallet).toBe('OKX');

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

    const result = await DeployOKXAccountSignature(accountDetails);

    const deployResult = JSON.parse(result);
    expect(deployResult.status).toBe('success');

    if (deployResult.status === 'success') {
      console.log('Account deployed successfully!');
      console.log('Transaction hash:', deployResult.transactionHash);
    } else {
      console.error('Deployment failed:', deployResult.error);
    }
  }, 30000); // 30 seconds timeout
});
