import { getApproved } from 'src/lib/agent/plugins/erc721/actions/getApproved';
import { createMockStarknetAgent } from 'test/jest/setEnvVars';

const agent = createMockStarknetAgent();
const NFT_ADDRESS = '0x04165af38fe2ce3bf1ec84b90f38a491a949b6c7ec7373242806f82d348715da';

describe('Get Approved Address for Token', () => {
  describe('With perfect match inputs', () => {
    it('should return approved address for valid token', async () => {
      const params = {
        tokenId: '1',
        contractAddress: NFT_ADDRESS
      };

      const result = await getApproved(agent, params);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'success',
        approved: expect.any(String)
      });
    });
  });

  describe('With wrong inputs', () => {
    it('should fail with invalid token ID', async () => {
      const params = {
        tokenId: 'invalid_id',
        contractAddress: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'
      };

      const result = await getApproved(agent, params);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure'
      });
    });
  });
});
