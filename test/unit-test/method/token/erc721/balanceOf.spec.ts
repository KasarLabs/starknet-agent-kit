import { getBalance } from 'src/lib/agent/plugins/erc721/actions/balanceOf';
import { createMockStarknetAgent } from 'test/jest/setEnvVars';

const agent = createMockStarknetAgent();
const NFT_ADDRESS = '0x04165af38fe2ce3bf1ec84b90f38a491a949b6c7ec7373242806f82d348715da';

describe('Get NFT Balance', () => {
  describe('With perfect match inputs', () => {
    it('should return balance for valid address', async () => {
      const params = {
        accountAddress: process.env.STARKNET_PUBLIC_ADDRESS as string,
        contractAddress: NFT_ADDRESS
      };

      const result = await getBalance(agent, params);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'success',
        balance: expect.any(String)
      });
    });
  });

  describe('With wrong inputs', () => {
    it('should fail with invalid account address', async () => {
      const params = {
        accountAddress: 'invalid_address',
        contractAddress: NFT_ADDRESS
      };

      const result = await getBalance(agent, params);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure'
      });
    });

    it('should fail with invalid contract address', async () => {
      const params = {
        accountAddress: process.env.STARKNET_PUBLIC_ADDRESS as string,
        contractAddress: 'invalid_address'
      };

      const result = await getBalance(agent, params);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure'
      });
    });
  });
});