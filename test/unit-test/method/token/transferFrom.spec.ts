import { transferFrom } from 'src/lib/agent/plugins/erc20/actions/transferFrom';
import { createMockStarknetAgent } from 'test/jest/setEnvVars';
import { setupTestEnvironment } from 'test/utils/helpers';

const agent = createMockStarknetAgent();

setupTestEnvironment();

describe('Transfer from', () => {
  describe('With perfect match inputs', () => {
    it('should transfer tokens from one address to another', async () => {
      // Arrange
      const params = {
        fromAddress: process.env.STARKNET_PUBLIC_ADDRESS as string,
        toAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        amount: '0.1',
        tokenAddress: process.env.ETH_ADDRESS as string,
      };

      // Act
      const result = await transferFrom(agent, params);
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed).toMatchObject({
        status: 'success',
        transactionHash: expect.any(String),
      });
    });
  });

  describe('With wrong input', () => {
    it('should fail with invalid from address', async () => {
      // Arrange
      const params = {
        fromAddress: 'invalid_address',
        toAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        amount: '0.1',
        tokenAddress: process.env.ETH_ADDRESS as string,
      };

      // Act
      const result = await transferFrom(agent, params);
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed).toMatchObject({
        status: 'failure',
      });
    });

    it('should fail with invalid to address', async () => {
      // Arrange
      const params = {
        fromAddress: process.env.STARKNET_PUBLIC_ADDRESS as string,
        toAddress: 'invalid_address',
        amount: '0.1',
        tokenAddress: process.env.ETH_ADDRESS as string,
      };

      // Act
      const result = await transferFrom(agent, params);
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed).toMatchObject({
        status: 'failure',
      });
    });

    it('should fail with invalid amount format', async () => {
      // Arrange
      const params = {
        fromAddress: process.env.STARKNET_PUBLIC_ADDRESS as string,
        toAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        amount: 'WRONG_AMOUNT',
        tokenAddress: process.env.ETH_ADDRESS as string,
      };

      // Act
      const result = await transferFrom(agent, params);
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed).toMatchObject({
        status: 'failure',
      });
    });

    it('should fail with invalid token address', async () => {
      // Arrange
      const params = {
        fromAddress: process.env.STARKNET_PUBLIC_ADDRESS as string,
        toAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        amount: '0.1',
        tokenAddress: 'invalid_address',
      };

      // Act
      const result = await transferFrom(agent, params);
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed).toMatchObject({
        status: 'failure',
      });
    });
  });

  describe('With insufficient allowance', () => {
    it('should fail when trying to transfer more than allowed', async () => {
      // Arrange
      const params = {
        fromAddress: process.env.STARKNET_PUBLIC_ADDRESS as string,
        toAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        amount: '1000000',
        tokenAddress: process.env.ETH_ADDRESS as string,
      };

      // Act
      const result = await transferFrom(agent, params);
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed).toMatchObject({
        status: 'failure',
      });
    });
  });
}); 