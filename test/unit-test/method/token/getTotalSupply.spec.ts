import { getTotalSupply } from 'src/lib/agent/plugins/erc20/actions/getTotaSupply';
import { createMockStarknetAgent } from 'test/jest/setEnvVars';
import { setupTestEnvironment } from 'test/utils/helpers';

const agent = createMockStarknetAgent();

setupTestEnvironment();

describe('Get total supply', () => {
  describe('With perfect match inputs', () => {
    it('should get total supply for ETH', async () => {
      const tokenAddress = 'ETH';

      const result = await getTotalSupply(agent, tokenAddress);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'success',
        totalSupply: expect.any(String),
      });
    });
  });

  describe('With wrong input', () => {
    it('should fail with invalid token address', async () => {
      const tokenAddress = 'invalid_address';

      const result = await getTotalSupply(agent, tokenAddress);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure',
      });
    });
  });
});
