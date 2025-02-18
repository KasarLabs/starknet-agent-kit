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
        spenderAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        amount: '0.0000001',
        assetSymbol: 'ETH' as string,
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

  // describe('With wrong input', () => {
  //   it('should fail with invalid spender address', async () => {
  //     // Arrange
  //     const params = {
  //       spenderAddress: 'invalid_address',
  //       amount: '1.0',
  //       tokenAddress: process.env.ETH_ADDRESS as string,
  //     };

  //     // Act
  //     const result = await approve(agent, params);
  //     const parsed = JSON.parse(result);

  //     // Assert
  //     expect(parsed).toMatchObject({
  //       status: 'failure',
  //     });
  //   });

  //   it('should fail with invalid amount format', async () => {
  //     // Arrange
  //     const params = {
  //       spenderAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
  //       amount: 'WRONG_AMOUNT',
  //       tokenAddress: process.env.ETH_ADDRESS as string,
  //     };

  //     // Act
  //     const result = await approve(agent, params);
  //     const parsed = JSON.parse(result);

  //     // Assert
  //     expect(parsed).toMatchObject({
  //       status: 'failure',
  //     });
  //   });

  //   it('should fail with invalid token address', async () => {
  //     // Arrange
  //     const params = {
  //       spenderAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
  //       amount: '1.0',
  //       tokenAddress: 'invalid_address',
  //     };

  //     // Act
  //     const result = await approve(agent, params);
  //     const parsed = JSON.parse(result);

  //     // Assert
  //     expect(parsed).toMatchObject({
  //       status: 'failure',
  //     });
  //   });
  // });
}); 