import { isApprovedForAll } from 'src/lib/agent/plugins/erc721/actions/isApprovedForAll';
import { createMockStarknetAgent } from 'test/jest/setEnvVars';

const agent = createMockStarknetAgent();
const NFT_ADDRESS = '0x04165af38fe2ce3bf1ec84b90f38a491a949b6c7ec7373242806f82d348715da';

describe('Check if Operator is Approved For All', () => {
  describe('With perfect match inputs', () => {
    it('should return approval status for valid addresses', async () => {
      const params = {
        ownerAddress: process.env.STARKNET_PUBLIC_ADDRESS as string,
        operatorAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        contractAddress: NFT_ADDRESS
      };

      const result = await isApprovedForAll(agent, params);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'success',
        isApproved: expect.any(Boolean)
      });
    });
  });

  describe('With wrong inputs', () => {
    it('should fail with invalid owner address', async () => {
      const params = {
        ownerAddress: 'invalid_address',
        operatorAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        contractAddress: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'
      };

      const result = await isApprovedForAll(agent, params);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure'
      });
    });
  });
});