import { getOwner } from 'src/lib/agent/plugins/erc721/actions/ownerOf';
import { createMockStarknetAgent } from 'test/jest/setEnvVars';

const agent = createMockStarknetAgent();
const NFT_ADDRESS = '0x04165af38fe2ce3bf1ec84b90f38a491a949b6c7ec7373242806f82d348715da';

describe('Get Owner of Token', () => {
  describe('With perfect match inputs', () => {
    it('should return owner address for a valid token', async () => {
      const params = {
        tokenId: '1',
        contractAddress: NFT_ADDRESS
      };

      const result = await getOwner(agent, params);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'success',
        owner: expect.any(String)
      });
    });
  });

  describe('With wrong inputs', () => {
    it('should fail with invalid token ID', async () => {
      const params = {
        tokenId: 'invalid_id',
        contractAddress: NFT_ADDRESS
      };

      const result = await getOwner(agent, params);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure'
      });
    });

    it('should fail with invalid contract address', async () => {
      const params = {
        tokenId: '1',
        contractAddress: 'invalid_address'
      };

      const result = await getOwner(agent, params);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure'
      });
    });
  });
});