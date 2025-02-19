import { approve } from 'src/lib/agent/plugins/erc20/actions/approve';
import { createMockStarknetAgent } from 'test/jest/setEnvVars';
import { setupTestEnvironment } from 'test/utils/helpers';

const agent = createMockStarknetAgent();

setupTestEnvironment();

describe('Approve token spending', () => {
  describe('With perfect match inputs', () => {
    it('should approve spender to spend tokens', async () => {
      // Arrange
      const params = {
        spender_address: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        amount: '1.0',
        symbol: 'STRK' as string,
      };

      // Act
      const result = await approve(agent, params);
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed).toMatchObject({
        status: 'success',
        transactionHash: expect.any(String),
      });
    });
  });

  describe('With wrong input', () => {
    it('should fail with invalid spender address', async () => {
      // Arrange
      const params = {
        spender_address: 'invalid_address',
        amount: '1.0',
        symbol: 'ETH' as string,
      };

      // Act
      const result = await approve(agent, params);
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed).toMatchObject({
        status: 'failure',
      });
    });

    it('should fail with invalid amount format', async () => {
      // Arrange
      const params = {
        spender_address: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        amount: 'WRONG_AMOUNT',
        symbol: 'ETH' as string,
      };

      // Act
      const result = await approve(agent, params);
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed).toMatchObject({
        status: 'failure',
      });
    });

    it('should fail with invalid token symbol', async () => {
      // Arrange
      const params = {
        spender_address: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        amount: '1.0',
        symbol: 'PPPPP'
      };

      // Act
      const result = await approve(agent, params);
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed).toMatchObject({
        status: 'failure',
      });
    });
  });
}); 