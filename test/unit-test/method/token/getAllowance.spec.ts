import { getAllowance } from 'src/lib/agent/plugins/erc20/actions/getAllowance';
import { approve } from 'src/lib/agent/plugins/erc20/actions/approve';
import { createMockStarknetAgent } from 'test/jest/setEnvVars';
import { setupTestEnvironment } from 'test/utils/helpers';

const agent = createMockStarknetAgent();

setupTestEnvironment();

describe('Get allowance', () => {
  describe('With perfect match inputs', () => {
    it('should get allowance between owner and spender', async () => {
        const params = {
          spender_address: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
          amount: '8.2',
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
      // Arrange
      const params2 = {
        ownerAddress: process.env.STARKNET_PUBLIC_ADDRESS as string,
        spenderAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        assetSymbol: 'STRK',
      };

      // Act
      const result2 = await getAllowance(agent, params2);
      const parsed2 = JSON.parse(result2);

      console.log('parsed2', parsed2);
      // Assert
      expect(parsed2).toMatchObject({
        status: 'success',
        owner: process.env.STARKNET_PUBLIC_ADDRESS,
        spender: process.env.STARKNET_PUBLIC_ADDRESS_2,
      });

      expect(parsed2.allowance).toBeDefined();
      expect(parsed2.allowance).toMatch('8.2');
    });

  //   it('should get allowance between owner and spender', async () => {
  //     // Arrange
  //     const params = {
  //       ownerAddress: process.env.STARKNET_PUBLIC_ADDRESS as string,
  //       spenderAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
  //       assetSymbol: 'ETH',
  //     };

  //     // Act
  //     const result = await getAllowance(agent, params);
  //     const parsed = JSON.parse(result);

  //     // Assert
  //     expect(parsed).toMatchObject({
  //       status: 'success',
  //       owner: process.env.STARKNET_PUBLIC_ADDRESS,
  //       spender: process.env.STARKNET_PUBLIC_ADDRESS_2,
  //     });
  //     expect(parsed.allowance).toBeDefined();
  //   });
  // });

  // describe('With wrong input', () => {
  //   it('should fail with invalid owner address', async () => {
  //     // Arrange
  //     const params = {
  //       ownerAddress: 'invalid_address',
  //       spenderAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
  //       assetSymbol: 'ETH',
  //     };

  //     // Act
  //     const result = await getAllowance(agent, params);
  //     const parsed = JSON.parse(result);

  //     // Assert
  //     expect(parsed).toMatchObject({
  //       status: 'failure',
  //     });
  //   });

  //   it('should fail with invalid spender address', async () => {
  //     // Arrange
  //     const params = {
  //       ownerAddress: process.env.STARKNET_PUBLIC_ADDRESS as string,
  //       spenderAddress: 'invalid_address',
  //       assetSymbol: 'ETH',
  //     };

  //     // Act
  //     const result = await getAllowance(agent, params);
  //     const parsed = JSON.parse(result);

  //     // Assert
  //     expect(parsed).toMatchObject({
  //       status: 'failure',
  //     });
  //   });

  //   it('should fail with invalid token address', async () => {
  //     // Arrange
  //     const params = {
  //       ownerAddress: process.env.STARKNET_PUBLIC_ADDRESS as string,
  //       spenderAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
  //       assetSymbol: 'BLBLBLB',
  //     };

  //     // Act
  //     const result = await getAllowance(agent, params);
  //     const parsed = JSON.parse(result);

  //     // Assert
  //     expect(parsed).toMatchObject({
  //       status: 'failure',
  //     });
  //   });
  });
}); 