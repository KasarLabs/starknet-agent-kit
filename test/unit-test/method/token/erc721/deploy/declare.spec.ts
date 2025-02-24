import { declareContract } from 'src/lib/agent/plugins/core/contract/actions/declare';
import { createMockStarknetAgent } from 'test/jest/setEnvVars';
import { compiledContract } from '../../../fixtures/nft-contract';  // You'll need to create this fixture

const agent = createMockStarknetAgent();

describe('Declare NFT Contract', () => {
  describe('With perfect match inputs', () => {
    it('should successfully declare contract', async () => {
      const params = {
        contract: compiledContract,
        classHash: '0x123...', // Add your class hash
        compiledClassHash: '0x456...' // Add your compiled class hash
      };

      const result = await declareContract(params, agent);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'success',
        transactionHash: expect.any(String),
        classHash: expect.any(String)
      });
    });
  });

  describe('With wrong inputs', () => {
    it('should fail with invalid contract', async () => {
      const params = {
        contract: {},
        classHash: '0x123...',
        compiledClassHash: '0x456...'
      };

      const result = await declareContract(params, agent);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure',
        error: expect.any(String)
      });
    });

    it('should fail with invalid class hash', async () => {
      const params = {
        contract: compiledContract,
        classHash: 'invalid_hash',
        compiledClassHash: '0x456...'
      };

      const result = await declareContract(params, agent);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure',
        error: expect.any(String)
      });
    });
  });
});