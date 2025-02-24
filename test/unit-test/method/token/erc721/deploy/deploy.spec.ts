import { deployContract } from 'src/lib/agent/plugins/core/contract/actions/deploy';
import { createMockStarknetAgent } from 'test/jest/setEnvVars';

const agent = createMockStarknetAgent();

describe('Deploy NFT Contract', () => {
  describe('With perfect match inputs', () => {
    it('should successfully deploy contract', async () => {
      const params = {
        classHash: '0x123...', // Use your declared class hash
        constructorCalldata: [
          'MyNFT', // name
          'NFT',   // symbol
          process.env.STARKNET_PUBLIC_ADDRESS // owner
        ],
        salt: '0x789...' // Optional: Add custom salt
      };

      const result = await deployContract(params, agent);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'success',
        transactionHash: expect.any(String),
        contractAddress: expect.any(String)
      });
    });
  });

  describe('With wrong inputs', () => {
    it('should fail with invalid class hash', async () => {
      const params = {
        classHash: 'invalid_hash',
        constructorCalldata: [
          'MyNFT',
          'NFT',
          process.env.STARKNET_PUBLIC_ADDRESS
        ]
      };

      const result = await deployContract(params, agent);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure',
        error: expect.any(String)
      });
    });

    it('should fail with invalid constructor parameters', async () => {
      const params = {
        classHash: '0x123...',
        constructorCalldata: [] // Empty constructor params
      };

      const result = await deployContract(params, agent);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure',
        error: expect.any(String)
      });
    });
  });
});