import { setApprovalForAll } from 'src/lib/agent/plugins/erc721/actions/setApprovalForAll';
import { createMockStarknetAgent, createMockInvalidStarknetAgent } from 'test/jest/setEnvVars';

const agent = createMockStarknetAgent();
const wrong_agent = createMockInvalidStarknetAgent();
const NFT_ADDRESS = '0x04165af38fe2ce3bf1ec84b90f38a491a949b6c7ec7373242806f82d348715da';

describe('Set Approval For All', () => {
  describe('With perfect match inputs', () => {
    it('should approve operator for all tokens', async () => {
      const params = {
        operatorAddress: process.env.STARKNET_PUBLIC_ADDRESS as string,
        approved: true,
        contractAddress: NFT_ADDRESS
      };

      const result = await setApprovalForAll(agent, params);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'success',
        operator: expect.any(String),
        approved: true,
        transactionHash: expect.any(String)
      });
    });

    it('should revoke approval for operator', async () => {
      const params = {
        operatorAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        approved: false,
        contractAddress: NFT_ADDRESS
      };

      const result = await setApprovalForAll(agent, params);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'success',
        operator: expect.any(String),
        approved: false,
        transactionHash: expect.any(String)
      });
    });
  });

  describe('With wrong inputs', () => {
    it('should fail with invalid operator address', async () => {
      const params = {
        operatorAddress: 'invalid_address',
        approved: true,
        contractAddress: NFT_ADDRESS
      };

      const result = await setApprovalForAll(agent, params);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure',
        error: expect.any(String)
      });
    });

    it('should fail with invalid agent', async () => {
      const params = {
        operatorAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        approved: true,
        contractAddress: NFT_ADDRESS
      };

      const result = await setApprovalForAll(wrong_agent, params);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure'
      });
    });

    it('should fail without approval status', async () => {
      const params = {
        operatorAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        contractAddress: NFT_ADDRESS
      } as any;

      const result = await setApprovalForAll(agent, params);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure',
        error: expect.any(String)
      });
    });
  });
});