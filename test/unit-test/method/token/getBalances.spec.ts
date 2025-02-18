import { getBalance } from 'src/lib/agent/plugins/erc20/actions/getBalances';
import { createMockStarknetAgent } from 'test/jest/setEnvVars';
import { setupTestEnvironment } from 'test/utils/helpers';

const agent = createMockStarknetAgent();

setupTestEnvironment();

describe('Get token balances', () => {
  describe('With perfect match inputs', () => {
    it('should get ETH balance for a valid address', async () => {
      // Arrange
      const params = {
        accountAddress: process.env.STARKNET_PUBLIC_ADDRESS as string,
        assetSymbol: 'ETH',
      };

      // Act
      const result = await getBalance(agent, params);
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed).toMatchObject({
        status: 'success',
        balance: expect.any(String),
      });
    });
  });

  describe('With wrong input', () => {
    it('should fail with invalid address', async () => {
      // Arrange
      const params = {
        accountAddress: 'invalid_address',
        assetSymbol: 'ETH',
      };

      // Act
      const result = await getBalance(agent, params);
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed).toMatchObject({
        status: 'failure',
      });
    });

    it('should fail with invalid token symbol', async () => {
      // Arrange
      const params = {
        accountAddress: process.env.STARKNET_PUBLIC_ADDRESS as string,
        assetSymbol: 'INVALID_TOKEN',
      };

      // Act
      const result = await getBalance(agent, params);
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed).toMatchObject({
        status: 'failure',
      });
    });
  });
});
